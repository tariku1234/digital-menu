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
} from "firebase/firestore"
import { db } from "./firebase.service.js"
import QRCode from "qrcode"
import { uploadImage } from "./supabase.service.js"

/**
 * Generate QR code for a restaurant
 */
export const generateQRCode = async (restaurantId, restaurantName) => {
  try {
    // Generate the menu URL
    const menuUrl = `${window.location.origin}/menu/${restaurantId}`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Convert data URL to blob for storage
    const response = await fetch(qrCodeDataUrl)
    const blob = await response.blob()
    const file = new File([blob], `qr-${restaurantId}.png`, { type: "image/png" })

    // Upload to Supabase
    const uploadResult = await uploadImage(file, "qr-codes", "")

    if (!uploadResult.success) {
      throw new Error("Failed to upload QR code")
    }

    // Save QR code info to Firestore
    const qrCodeRef = await addDoc(collection(db, "qrCodes"), {
      restaurantId,
      qrCodeUrl: uploadResult.url,
      qrCodePath: uploadResult.path,
      qrCodeDataUrl: qrCodeDataUrl, // Keep data URL for quick preview
      menuUrl,
      scans: 0,
      lastScannedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Update restaurant with QR code reference
    await updateDoc(doc(db, "restaurants", restaurantId), {
      qrCodeId: qrCodeRef.id,
      updatedAt: serverTimestamp(),
    })

    return {
      success: true,
      qrCodeId: qrCodeRef.id,
      qrCodeUrl: uploadResult.url,
      qrCodeDataUrl: qrCodeDataUrl,
      menuUrl,
    }
  } catch (error) {
    console.error("Error generating QR code:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get QR code for a restaurant
 */
export const getQRCode = async (restaurantId) => {
  try {
    const q = query(collection(db, "qrCodes"), where("restaurantId", "==", restaurantId))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return { success: false, error: "QR code not found" }
    }

    const qrCodeDoc = querySnapshot.docs[0]
    return {
      success: true,
      qrCode: { id: qrCodeDoc.id, ...qrCodeDoc.data() },
    }
  } catch (error) {
    console.error("Error getting QR code:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Track QR code scan
 */
export const trackQRScan = async (restaurantId) => {
  try {
    const q = query(collection(db, "qrCodes"), where("restaurantId", "==", restaurantId))

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const qrCodeDoc = querySnapshot.docs[0]
      await updateDoc(doc(db, "qrCodes", qrCodeDoc.id), {
        scans: increment(1),
        lastScannedAt: serverTimestamp(),
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error tracking QR scan:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Download QR code as PNG
 */
export const downloadQRCode = (qrCodeDataUrl, restaurantName) => {
  const link = document.createElement("a")
  link.href = qrCodeDataUrl
  link.download = `${restaurantName}-qr-code.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Regenerate QR code (if URL format changes)
 */
export const regenerateQRCode = async (restaurantId, restaurantName) => {
  try {
    // Delete old QR code reference (optional)
    const q = query(collection(db, "qrCodes"), where("restaurantId", "==", restaurantId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const oldQRCodeId = querySnapshot.docs[0].id
      // We keep the old one for history, just create a new one
    }

    // Generate new QR code
    return await generateQRCode(restaurantId, restaurantName)
  } catch (error) {
    console.error("Error regenerating QR code:", error)
    return { success: false, error: error.message }
  }
}
