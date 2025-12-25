import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase.service.js";
import QRCode from "qrcode";
import { uploadImage, deleteImageByPublicId } from "./cloudinary.service.js";

/**
 * Generate QR code for a restaurant
 */
export const generateQRCode = async (restaurantId, restaurantName) => {
  try {
    const menuUrl = `${window.location.origin}/menu/${restaurantId}`;

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Convert DataURL → File
    const response = await fetch(qrCodeDataUrl);
    const blob = await response.blob();
    const file = new File([blob], `qr-${restaurantId}.png`, {
      type: "image/png",
    });

    // Upload to Cloudinary
    const uploadResult = await uploadImage(file, "qr-codes");

    if (!uploadResult.success) {
      throw new Error("QR upload failed");
    }

    // Save to Firestore
    const qrCodeRef = await addDoc(collection(db, "qr_codes"), {
      restaurantId,
      restaurantName,
      qrCodeUrl: uploadResult.url,
      qrCodePublicId: uploadResult.publicId,
      qrCodeDataUrl, // quick preview
      menuUrl,
      scans: 0,
      lastScannedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update restaurant
    await updateDoc(doc(db, "restaurants", restaurantId), {
      qrCodeId: qrCodeRef.id,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      qrCodeId: qrCodeRef.id,
      qrCodeUrl: uploadResult.url,
      qrCodeDataUrl,
      menuUrl,
    };
  } catch (error) {
    console.error("Generate QR error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get QR code
 */
export const getQRCode = async (restaurantId) => {
  try {
    const q = query(
      collection(db, "qr_codes"),
      where("restaurantId", "==", restaurantId)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, error: "QR not found" };
    }

    const docData = snap.docs[0];
    return {
      success: true,
      qrCode: { id: docData.id, ...docData.data() },
    };
  } catch (error) {
    console.error("Get QR error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Track scan
 */
export const trackQRScan = async (restaurantId) => {
  try {
    const q = query(
     collection(db, "qr_codes"),
      where("restaurantId", "==", restaurantId)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      await updateDoc(doc(db, "qr_codes", snap.docs[0].id), {
        scans: increment(1),
        lastScannedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Track scan error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Download QR code
 */
export const downloadQRCode = (qrCodeDataUrl, restaurantName) => {
  const link = document.createElement("a");
  link.href = qrCodeDataUrl;
  link.download = `${restaurantName}-qr.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Regenerate QR code
 */
export const regenerateQRCode = async (restaurantId, restaurantName) => {
  try {
    const q = query(
      collection(db, "qr_codes"),
      where("restaurantId", "==", restaurantId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const oldQRCodeDoc = snap.docs[0];
      const oldQRCodeData = oldQRCodeDoc.data();

      // 1️⃣ Delete old Cloudinary image
      if (oldQRCodeData.qrCodePublicId) {
        await deleteImageByPublicId(oldQRCodeData.qrCodePublicId);
      }

      // 2️⃣ Delete old Firestore doc
      await deleteDoc(doc(db, "qr_codes", oldQRCodeDoc.id));
    }

    // 3️⃣ Generate new QR code
    return await generateQRCode(restaurantId, restaurantName);
  } catch (error) {
    console.error("Regenerate QR error:", error);
    return { success: false, error: error.message };
  }
};
