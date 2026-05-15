// ============================================================
// VIDYASPARK — Firebase Configuration
// ============================================================
// SETUP:
// 1. Go to https://console.firebase.google.com → Create project
// 2. Authentication → Sign-in method → Enable "Email/Password"
// 3. Firestore → Create database (start in test mode)
// 4. Storage → Get started
// 5. Project Settings → General → Add web app → copy config below
// ============================================================

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth    = firebase.auth();
const db      = firebase.firestore();
const storage = firebase.storage();

// Offline persistence
db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });
db.enablePersistence({ synchronizeTabs: true })
  .then(() => console.log('✅ Offline persistence enabled'))
  .catch(err => console.warn('Persistence warning:', err.code));

window.__isOnline = navigator.onLine;
window.addEventListener('online',  () => { window.__isOnline = true; });
window.addEventListener('offline', () => { window.__isOnline = false; });

console.log('🔥 VidyaSpark Firebase ready');

// ============================================================
// FIRESTORE RULES — Paste in Firebase Console > Firestore > Rules
// ============================================================
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() { return request.auth != null; }
    function isOwner(uid) { return isAuth() && request.auth.uid == uid; }
    function getRole() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role; }
    function isTeacherOrAdmin() { return isAuth() && getRole() in ['teacher','admin']; }
    function isAdmin() { return isAuth() && getRole() == 'admin'; }

    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) || isAdmin();
    }
    match /courses/{courseId} {
      allow read: if isAuth();
      allow write: if isTeacherOrAdmin();
    }
    match /courses/{courseId}/lessons/{lessonId} {
      allow read: if isAuth();
      allow write: if isTeacherOrAdmin();
    }
    match /quizzes/{quizId} {
      allow read: if isAuth();
      allow write: if isTeacherOrAdmin();
    }
    match /progress/{progressId} {
      allow read: if isAuth() && (request.auth.uid == resource.data.userId || isTeacherOrAdmin());
      allow create: if isAuth() && request.auth.uid == request.resource.data.userId;
      allow update: if isAuth() && request.auth.uid == resource.data.userId;
    }
    match /rewards/{rewardId} {
      allow read: if isAuth() && (request.auth.uid == resource.data.userId || isAdmin());
      allow create: if isAuth() && request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAdmin();
    }
    match /schools/{schoolId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }
    match /leaderboard/{userId} {
      allow read: if isAuth();
      allow write: if isAuth() && request.auth.uid == userId || isAdmin();
    }
    match /challenges/{challengeId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }
  }
}
*/

// ============================================================
// STORAGE RULES — Paste in Firebase Console > Storage > Rules
// ============================================================
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['teacher','admin'];
    }
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
*/