// Firebase Configuration
// Make sure to set these values in your .env file
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id",
}

// Log configuration status
console.log("[v0] Firebase config loaded:", {
  hasApiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "your-api-key",
  hasProjectId: !!firebaseConfig.projectId && firebaseConfig.projectId !== "your-project-id",
})
