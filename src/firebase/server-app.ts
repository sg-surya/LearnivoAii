
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let adminApp: App;

if (getApps().length === 0) {
    if (serviceAccount) {
        // For Vercel, etc. where you set the service account key as an env var
        adminApp = initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        // For local development with emulators or default credentials
         adminApp = initializeApp();
    }
} else {
  adminApp = getApps()[0];
}


export function getAdminApp() {
  return adminApp;
}
