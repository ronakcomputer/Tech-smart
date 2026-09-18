/* ============================================================
   TechSmart — Firebase connection settings
   ------------------------------------------------------------
   This is what makes admin panel changes show up for EVERY
   visitor, on every device, instantly — instead of only on
   the one browser that made the change.

   HOW TO FILL THIS IN (free, ~5 minutes):
   See README.md → "Cloud Setup (Firebase)" for full step-by-step
   instructions with screenshotable steps. Short version:
     1. Go to https://console.firebase.google.com → Add project
     2. Build → Firestore Database → Create database (Start in
        test mode is fine to begin with) → pick a region
     3. Project settings (gear icon) → General → "Your apps" →
        click the </> (Web) icon → register an app (any nickname)
     4. Firebase shows you a firebaseConfig object — copy those
        values into TS_FIREBASE_CONFIG below.
     5. Set Firestore's Rules (Firestore Database → Rules tab) as
        shown in the README, then click "Publish".

   Until you fill in real values below, the site automatically
   keeps working exactly as before (each browser's own local
   storage) — nothing breaks, it just won't sync between devices
   yet.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDcfW1NmudLgOvzSa33StBuJskoVqRnFis",
  authDomain: "techsmart-website-c0528.firebaseapp.com",
  projectId: "techsmart-website-c0528",
  storageBucket: "techsmart-website-c0528.firebasestorage.app",
  messagingSenderId: "737865016288",
  appId: "1:737865016288:web:f99949ff39a8197af5c185"
};
