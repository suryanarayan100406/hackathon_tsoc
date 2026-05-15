// ============================================================
// VIDYASPARK — Authentication Module (Enhanced)
// Phase 2: Full Auth with Demo Accounts + Robust Error Handling
// ============================================================

const Auth = (() => {

  let currentUser  = null;
  let userProfile  = null;

  // ── Auth Guard ──────────────────────────────────────────────
  function requireAuth(allowedRoles = []) {
    return new Promise((resolve, reject) => {
      const unsub = auth.onAuthStateChanged(async (user) => {
        unsub();
        if (!user) { window.location.href = 'C:\\Users\\envir\\Desktop\\vidyaspark\\index.html'; return reject('Not authenticated'); }
        try {
          const profile = await getUserProfile(user.uid);
          if (allowedRoles.length && !allowedRoles.includes(profile.role)) {
            alert('⚠️ Access denied. Redirecting to your dashboard...');
            redirectByRole(profile.role);
            return reject('Wrong role');
          }
          currentUser = user;
          userProfile = profile;
          await updateStreak(user.uid, profile);
          resolve({ user, profile });
        } catch (err) {
          console.error('Auth guard error:', err);
          window.location.href = 'C:\\Users\\envir\\Desktop\\vidyaspark\\index.html';
          reject(err);
        }
      });
    });
  }

  // ── Get User Profile ────────────────────────────────────────
  async function getUserProfile(uid) {
    const cached = sessionStorage.getItem('vs_profile_' + uid);
    if (cached) {
      try {
        const p = JSON.parse(cached);
        // Background refresh
        db.collection('users').doc(uid).get().then(snap => {
          if (snap.exists) sessionStorage.setItem('vs_profile_' + uid, JSON.stringify({ uid, ...snap.data() }));
        });
        return p;
      } catch(e) { /* fall through */ }
    }
    const snap = await db.collection('users').doc(uid).get();
    if (!snap.exists) throw new Error('User profile not found. Please sign up again.');
    const profile = { uid, ...snap.data() };
    sessionStorage.setItem('vs_profile_' + uid, JSON.stringify(profile));
    return profile;
  }

  // ── Sign Up ─────────────────────────────────────────────────
  async function signUp({ name, email, password, role, classGrade, schoolName }) {
    showLoader('Creating your account...');
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });

      const now = firebase.firestore.FieldValue.serverTimestamp();
      const profileData = {
        name, email, role,
        schoolId:   schoolName || 'default',
        schoolName: schoolName || '',
        xp: 0, streak: 0,
        lastActive: now, lastStreakDate: null,
        language:   localStorage.getItem('vs_lang') || 'en',
        createdAt:  now,
        approved:   role !== 'teacher',
        badges: [], achievements: [],
      };

      if (role === 'student') {
        profileData.class = classGrade || '9';
        profileData.dailyChallengeDate = null;
      }

      const batch = db.batch();
      batch.set(db.collection('users').doc(cred.user.uid), profileData);

      if (role === 'student') {
        batch.set(db.collection('leaderboard').doc(cred.user.uid), {
          userId: cred.user.uid, name, xp: 0,
          schoolId: schoolName || 'default',
          class: classGrade || '9',
          week: getCurrentWeek(), rank: 0, updatedAt: now,
        });
      }
      await batch.commit();

      hideLoader();
      showSuccessToast(role === 'teacher'
        ? '✅ Account created! Awaiting admin approval.'
        : '🎉 Welcome to VidyaSpark!'
      );
      setTimeout(() => redirectByRole(role), 1500);
    } catch (err) {
      hideLoader();
      throw err;
    }
  }

  // ── Sign In ─────────────────────────────────────────────────
  async function signIn(email, password) {
    showLoader('Logging you in...');
    try {
      const cred    = await auth.signInWithEmailAndPassword(email, password);
      const profile = await getUserProfile(cred.user.uid);

      if (profile.role === 'teacher' && !profile.approved) {
        await auth.signOut();
        hideLoader();
        throw new Error('Your teacher account is pending admin approval. Please wait.');
      }

      await db.collection('users').doc(cred.user.uid).update({
        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
      });

      hideLoader();
      redirectByRole(profile.role);
    } catch (err) {
      hideLoader();
      throw err;
    }
  }

  // ── Sign Out ─────────────────────────────────────────────────
  async function signOut() {
    showLoader('Signing out...');
    try {
      await auth.signOut();
      sessionStorage.clear();
      localStorage.removeItem('vs_user_cache');
    } finally {
      window.location.href = 'C:\\Users\\envir\\Desktop\\vidyaspark\\index.html';
    }
  }

  // ── Forgot Password ─────────────────────────────────────────
  async function resetPassword(email) {
    await auth.sendPasswordResetEmail(email);
  }

  // ── Redirect By Role ────────────────────────────────────────
  function redirectByRole(role) {
    const routes = { student: 'student\\dashboard.html', teacher: 'teacher\\dashboard.html', admin: 'admin\\dashboard.html' };
    window.location.href = routes[role] || 'C:\\Users\\envir\\Desktop\\vidyaspark\\index.html';
  }

  // ── Streak Update ───────────────────────────────────────────
  async function updateStreak(uid, profile) {
    const today     = new Date().toDateString();
    const last      = profile.lastStreakDate;
    if (last === today) return;

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = last === yesterday ? (profile.streak || 0) + 1 : 1;
    const streakBroke = last && last !== yesterday && last !== today && (profile.streak || 0) > 2;

    await db.collection('users').doc(uid).update({
      streak: newStreak, lastStreakDate: today,
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    });

    userProfile = { ...profile, streak: newStreak, lastStreakDate: today };
    sessionStorage.setItem('vs_profile_' + uid, JSON.stringify(userProfile));

    if (newStreak === 3)   awardBadge(uid, 'streak_3',   '🔥', '3-Day Starter');
    if (newStreak === 7)   awardBadge(uid, 'streak_7',   '🔥', '7-Day Learner');
    if (newStreak === 30)  awardBadge(uid, 'streak_30',  '⚡', '30-Day Champion');
    if (newStreak === 100) awardBadge(uid, 'streak_100', '👑', '100-Day Legend');

    if (streakBroke) showWarningToast(`😢 Streak reset! You had a ${profile.streak}-day streak. Start fresh today!`);
  }

  // ── Award XP ────────────────────────────────────────────────
  async function addXP(uid, amount, source = 'quiz') {
    if (!uid || !amount) return;
    const ref = db.collection('users').doc(uid);
    await ref.update({ xp: firebase.firestore.FieldValue.increment(amount) });
    await db.collection('leaderboard').doc(uid).set({
      xp: firebase.firestore.FieldValue.increment(amount),
      week: getCurrentWeek(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    showXPPopup(amount);

    if (userProfile && userProfile.uid === uid) {
      userProfile.xp = (userProfile.xp || 0) + amount;
      sessionStorage.setItem('vs_profile_' + uid, JSON.stringify(userProfile));
    }

    const snap = await ref.get();
    const newXP = snap.data().xp;
    const prevXP = newXP - amount;
    if (prevXP < 100  && newXP >= 100)  awardBadge(uid, 'xp_100',  '⭐', 'First 100 XP');
    if (prevXP < 500  && newXP >= 500)  awardBadge(uid, 'xp_500',  '🌟', 'Rising Star');
    if (prevXP < 1000 && newXP >= 1000) awardBadge(uid, 'xp_1000', '🏆', 'Knowledge Hero');
    if (prevXP < 5000 && newXP >= 5000) awardBadge(uid, 'xp_5000', '👑', 'Grand Master');
    return newXP;
  }

  // ── Award Badge ─────────────────────────────────────────────
  async function awardBadge(uid, badgeId, icon, name) {
    try {
      const existing = await db.collection('rewards')
        .where('userId', '==', uid).where('badgeId', '==', badgeId).limit(1).get();
      if (!existing.empty) return;
      const batch = db.batch();
      batch.set(db.collection('rewards').doc(), {
        userId: uid, badgeId, type: 'badge', icon, name,
        earnedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      batch.update(db.collection('users').doc(uid), { badges: firebase.firestore.FieldValue.arrayUnion(badgeId) });
      await batch.commit();
      showBadgePopup(icon, name);
    } catch (err) { console.warn('Badge award error:', err); }
  }

  // ── Award Achievement ────────────────────────────────────────
  async function awardAchievement(uid, id, icon, name, description) {
    try {
      const existing = await db.collection('rewards')
        .where('userId', '==', uid).where('badgeId', '==', id).limit(1).get();
      if (!existing.empty) return;
      await db.collection('rewards').add({
        userId: uid, badgeId: id, type: 'achievement', icon, name,
        description: description || '',
        earnedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await db.collection('users').doc(uid).update({ achievements: firebase.firestore.FieldValue.arrayUnion(id) });
      showBadgePopup(icon, name);
    } catch (err) { console.warn('Achievement award error:', err); }
  }

  // ── Helpers ─────────────────────────────────────────────────
  function getCurrentWeek() {
    const now = new Date(), start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  function getCurrentUser()    { return currentUser; }
  function getCurrentProfile() { return userProfile; }

  // ── UI ───────────────────────────────────────────────────────
  function showLoader(message = 'Loading...') {
    let el = document.getElementById('vs-loader');
    if (!el) { el = document.createElement('div'); el.id = 'vs-loader'; el.className = 'loader-overlay'; document.body.appendChild(el); }
    el.innerHTML = `<div class="spinner"></div><p style="font-weight:700;color:var(--primary);margin-top:.5rem;">${message}</p>`;
    el.style.display = 'flex';
  }
  function hideLoader() {
    const el = document.getElementById('vs-loader');
    if (el) el.style.display = 'none';
  }
  function showXPPopup(amount) {
    const el = document.createElement('div');
    el.className = 'xp-popup';
    el.innerHTML = `⚡ +${amount} XP`;
    document.body.appendChild(el);
    setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 400); }, 2500);
  }
  function showBadgePopup(icon, name) {
    const overlay = document.createElement('div');
    overlay.className = 'badge-popup-overlay';
    overlay.innerHTML = `
      <div class="badge-popup-card">
        <div class="badge-popup-icon">${icon}</div>
        <div style="font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--accent);margin-bottom:.25rem;">Badge Earned!</div>
        <h2 style="color:var(--primary);margin-bottom:.5rem;font-size:1.4rem;">${name}</h2>
        <p style="color:var(--text-muted);margin-bottom:1.5rem;font-size:.9rem;">Keep going to earn more amazing badges!</p>
        <button class="btn btn-primary" onclick="this.closest('.badge-popup-overlay').remove()">Awesome! 🎉</button>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay && overlay.remove(), 5000);
  }
  function showUnlockAnimation(levelName = '') {
    const el = document.createElement('div');
    el.className = 'unlock-overlay';
    el.innerHTML = `<div class="unlock-burst"><div class="burst-icon">🔓</div><div class="burst-text">${levelName ? levelName + ' Unlocked!' : 'Level Unlocked!'}</div></div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }
  function showSuccessToast(msg) {
    _toast(msg, '#10b981');
  }
  function showWarningToast(msg) {
    _toast(msg, '#f59e0b');
  }
  function _toast(msg, bg) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:.875rem 1.5rem;border-radius:12px;font-weight:700;font-size:.9rem;z-index:10000;box-shadow:0 10px 25px rgba(0,0,0,.2);max-width:340px;text-align:center;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
  function showError(msg) {
    let el = document.getElementById('auth-error');
    if (!el) {
      el = document.createElement('div');
      el.id = 'auth-error';
      el.className = 'alert alert-danger';
      const form = document.querySelector('form:not(.hidden), .auth-card');
      if (form) form.prepend(el); else document.body.prepend(el);
    }
    el.textContent = '⚠️ ' + friendlyError(msg);
    el.style.display = 'flex';
    el.classList.remove('hidden');
    setTimeout(() => { if (el) { el.style.display = 'none'; el.classList.add('hidden'); } }, 5000);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function friendlyError(msg) {
    if (!msg) return 'An unexpected error occurred. Please try again.';
    const map = {
      'auth/user-not-found':         '📧 No account found with this email.',
      'auth/wrong-password':         '🔑 Incorrect password. Try again.',
      'auth/email-already-in-use':   '📧 This email is already registered.',
      'auth/weak-password':          '🔒 Password must be at least 6 characters.',
      'auth/invalid-email':          '📧 Please enter a valid email address.',
      'auth/too-many-requests':      '⏳ Too many attempts. Please wait a few minutes.',
      'auth/network-request-failed': '🌐 No internet connection. Check your network.',
      'auth/user-disabled':          '🚫 This account has been disabled. Contact admin.',
      'auth/invalid-credential':     '🔑 Invalid email or password.',
    };
    for (const [code, friendly] of Object.entries(map)) {
      if (msg.includes(code)) return friendly;
    }
    return msg.replace('Firebase: ', '').replace(/\s*\(auth\/[^)]*\)\.?\s*/g, '').trim() || 'An error occurred. Try again.';
  }

  // Offline banner
  function initOfflineBanner() {
    if (document.getElementById('vs-offline-banner')) return;
    const b = document.createElement('div');
    b.id = 'vs-offline-banner';
    b.className = 'offline-banner';
    b.innerHTML = '📴 You are offline. Some features may not work.';
    document.body.appendChild(b);
    const update = () => b.classList.toggle('show', !navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOfflineBanner);
  } else {
    setTimeout(initOfflineBanner, 0);
  }

  return {
    requireAuth, signUp, signIn, signOut, resetPassword,
    addXP, awardBadge, awardAchievement, updateStreak, getUserProfile,
    getCurrentUser, getCurrentProfile, redirectByRole,
    showXPPopup, showBadgePopup, showUnlockAnimation,
    showSuccessToast, showWarningToast, showLoader, hideLoader, showError,
    getCurrentWeek,
  };
})();