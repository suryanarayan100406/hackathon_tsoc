/* ============================================================
   VIDYASPARK — game.js
   Gamification Map Engine (Phase 6)
   Handles: Subject roadmap, level locking, XP, badges,
            streaks, daily challenges, leaderboard, TTS
   ============================================================ */

'use strict';

/* ── Curriculum Data ────────────────────────────────────────
   Each subject has chapters; each chapter has:
     id, title, icon, type ('lesson'|'quiz'|'boss'),
     xpReward, passMark (quiz only)
   ──────────────────────────────────────────────────────── */
const CURRICULUM = {
  math: {
    label: 'Mathematics', color: '#4f46e5', icon: '🧮',
    chapters: [
      { id:'m1',  title:'Number Systems',        icon:'🔢', type:'lesson', xpReward:50  },
      { id:'m2',  title:'Number Systems Quiz',    icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'m3',  title:'Algebra Basics',         icon:'📐', type:'lesson', xpReward:50  },
      { id:'m4',  title:'Algebra Quiz',           icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'m5',  title:'Linear Equations',       icon:'📏', type:'lesson', xpReward:60  },
      { id:'m6',  title:'Linear Equations Quiz',  icon:'📝', type:'quiz',   xpReward:120, passMark:70 },
      { id:'m7',  title:'Geometry',               icon:'📐', type:'lesson', xpReward:60  },
      { id:'m8',  title:'Geometry Quiz',          icon:'📝', type:'quiz',   xpReward:120, passMark:70 },
      { id:'m9',  title:'Statistics',             icon:'📊', type:'lesson', xpReward:70  },
      { id:'m10', title:'Statistics Boss Quiz',   icon:'🏆', type:'boss',   xpReward:200, passMark:70 },
    ]
  },
  physics: {
    label: 'Physics', color: '#0ea5e9', icon: '⚡',
    chapters: [
      { id:'p1',  title:'Motion & Force',         icon:'🏃', type:'lesson', xpReward:50  },
      { id:'p2',  title:'Motion Quiz',            icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'p3',  title:'Laws of Motion',         icon:'⚖️', type:'lesson', xpReward:60  },
      { id:'p4',  title:'Laws Quiz',              icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'p5',  title:'Gravitation',            icon:'🌍', type:'lesson', xpReward:60  },
      { id:'p6',  title:'Gravitation Quiz',       icon:'📝', type:'quiz',   xpReward:120, passMark:70 },
      { id:'p7',  title:'Light & Optics',         icon:'🔦', type:'lesson', xpReward:70  },
      { id:'p8',  title:'Physics Boss Quiz',      icon:'🏆', type:'boss',   xpReward:200, passMark:70 },
    ]
  },
  chemistry: {
    label: 'Chemistry', color: '#10b981', icon: '🧪',
    chapters: [
      { id:'c1',  title:'Matter & Atoms',         icon:'⚛️', type:'lesson', xpReward:50  },
      { id:'c2',  title:'Matter Quiz',            icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'c3',  title:'Periodic Table',         icon:'📋', type:'lesson', xpReward:60  },
      { id:'c4',  title:'Periodic Table Quiz',    icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'c5',  title:'Chemical Reactions',     icon:'💥', type:'lesson', xpReward:70  },
      { id:'c6',  title:'Reactions Quiz',         icon:'📝', type:'quiz',   xpReward:120, passMark:70 },
      { id:'c7',  title:'Acids & Bases',          icon:'🧫', type:'lesson', xpReward:70  },
      { id:'c8',  title:'Chemistry Boss Quiz',    icon:'🏆', type:'boss',   xpReward:200, passMark:70 },
    ]
  },
  biology: {
    label: 'Biology', color: '#ec4899', icon: '🌿',
    chapters: [
      { id:'b1',  title:'Cell Biology',           icon:'🔬', type:'lesson', xpReward:50  },
      { id:'b2',  title:'Cell Biology Quiz',      icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'b3',  title:'Human Digestive System', icon:'🫀', type:'lesson', xpReward:60  },
      { id:'b4',  title:'Digestive System Quiz',  icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'b5',  title:'Plant Kingdom',          icon:'🌱', type:'lesson', xpReward:60  },
      { id:'b6',  title:'Plant Kingdom Quiz',     icon:'📝', type:'quiz',   xpReward:120, passMark:70 },
      { id:'b7',  title:'Genetics & Evolution',   icon:'🧬', type:'lesson', xpReward:70  },
      { id:'b8',  title:'Biology Boss Quiz',      icon:'🏆', type:'boss',   xpReward:200, passMark:70 },
    ]
  },
  coding: {
    label: 'Coding', color: '#f59e0b', icon: '💻',
    chapters: [
      { id:'co1', title:'Intro to Programming',   icon:'👋', type:'lesson', xpReward:50  },
      { id:'co2', title:'Intro Quiz',             icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'co3', title:'Variables & Data Types', icon:'📦', type:'lesson', xpReward:60  },
      { id:'co4', title:'Variables Quiz',         icon:'📝', type:'quiz',   xpReward:100, passMark:70 },
      { id:'co5', title:'Loops & Conditions',     icon:'🔁', type:'lesson', xpReward:70  },
      { id:'co6', title:'Loops Quiz',             icon:'📝', type:'quiz',   xpReward:120, passMark:70 },
      { id:'co7', title:'Functions',              icon:'⚙️', type:'lesson', xpReward:70  },
      { id:'co8', title:'Coding Boss Quiz',       icon:'🏆', type:'boss',   xpReward:200, passMark:70 },
    ]
  }
};

/* ── Badge Definitions ──────────────────────────────────── */
const BADGES = [
  { id:'first_lesson', icon:'🌟', name:'First Step',      desc:'Complete your first lesson',           color:'#fbbf24' },
  { id:'streak_3',     icon:'🔥', name:'On Fire',         desc:'Maintain a 3-day streak',              color:'#ef4444' },
  { id:'streak_7',     icon:'🏆', name:'7-Day Learner',   desc:'Maintain a 7-day streak',              color:'#f97316' },
  { id:'streak_30',    icon:'👑', name:'Month Master',    desc:'30-day learning streak',               color:'#8b5cf6' },
  { id:'quiz_first',   icon:'📝', name:'Quiz Taker',      desc:'Pass your first quiz',                 color:'#10b981' },
  { id:'quiz_perfect', icon:'💯', name:'Quiz Champion',   desc:'Score 100% on any quiz',               color:'#06b6d4' },
  { id:'math_5',       icon:'🧮', name:'Math Warrior',    desc:'Complete 5 Math levels',               color:'#6366f1' },
  { id:'science_5',    icon:'⚗️', name:'Science Master',  desc:'Complete 5 Science levels',            color:'#10b981' },
  { id:'coding_5',     icon:'💻', name:'Code Ninja',      desc:'Complete 5 Coding levels',             color:'#f59e0b' },
  { id:'xp_500',       icon:'⚡', name:'Power Learner',   desc:'Earn 500 XP',                          color:'#4f46e5' },
  { id:'xp_1000',      icon:'🚀', name:'XP Rocket',       desc:'Earn 1000 XP',                         color:'#7c3aed' },
  { id:'daily_3',      icon:'📅', name:'Challenger',      desc:'Complete 3 daily challenges',          color:'#0ea5e9' },
  { id:'all_subjects', icon:'🌈', name:'Explorer',        desc:'Start all 5 subjects',                 color:'#ec4899' },
  { id:'boss_1',       icon:'🏅', name:'Boss Slayer',     desc:'Pass your first boss quiz',            color:'#f59e0b' },
];

/* ── Daily Challenges ───────────────────────────────────── */
const DAILY_CHALLENGES = [
  { id:'dc1', title:'Algebra Sprint',      desc:'Solve 5 algebra practice questions', xp:100, icon:'🧮', subject:'math'     },
  { id:'dc2', title:'Physics Challenger',  desc:'Complete 1 Physics lesson today',    xp:80,  icon:'⚡', subject:'physics'  },
  { id:'dc3', title:'Science Explorer',    desc:'Complete any Chemistry lesson',      xp:80,  icon:'🧪', subject:'chemistry'},
  { id:'dc4', title:'Code Sprinter',       desc:'Finish a Coding chapter',            xp:90,  icon:'💻', subject:'coding'   },
  { id:'dc5', title:'Quiz Blitz',          desc:'Pass any quiz with 80%+',           xp:120, icon:'📝', subject:'any'      },
  { id:'dc6', title:'Streak Saver',        desc:'Log in and complete 1 lesson',       xp:50,  icon:'🔥', subject:'any'      },
  { id:'dc7', title:'Bio Explorer',        desc:'Complete 1 Biology lesson',          xp:80,  icon:'🌿', subject:'biology'  },
];

/* ── GameMap Object ─────────────────────────────────────── */
const GameMap = (() => {

  let _subject = null;
  let _uid = null;
  let _userClass = null;
  let _progress = {};   // { chapterId: { status:'done'|'current'|'locked', score, attempts } }
  let _profile = null;  // live profile snapshot

  /* ── init ── */
  async function init(subject, uid, userClass) {
    _subject = subject;
    _uid = uid;
    _userClass = userClass;

    // Set title
    const subj = CURRICULUM[subject];
    if (!subj) return;
    const titleEl = document.getElementById('subject-title');
    const subEl   = document.getElementById('subject-sub');
    if (titleEl) titleEl.textContent = subj.label + ' — Learning Map';
    if (subEl)   subEl.textContent   = 'Your progress roadmap';

    // Set map title
    const mapTitle = document.getElementById('map-title');
    if (mapTitle) mapTitle.textContent = subj.icon + ' ' + subj.label;

    // Load progress from Firestore
    await loadProgress();
    renderMap();
    renderDailyChallenge();
  }

  /* ── loadProgress ── */
  async function loadProgress() {
    try {
      const snap = await firebase.firestore()
        .collection('users').doc(_uid).get();
      if (snap.exists) {
        _profile = snap.data();
        const subjectProgress = (_profile.progress || {})[_subject] || {};
        _progress = subjectProgress;
      }
    } catch(e) {
      console.warn('Firestore unavailable, using localStorage', e);
      _progress = JSON.parse(localStorage.getItem(`progress_${_uid}_${_subject}`) || '{}');
      _profile  = JSON.parse(localStorage.getItem(`profile_${_uid}`) || '{}');
    }
  }

  /* ── computeNodeStatus ── */
  function computeNodeStatus(chapters) {
    // Returns array of statuses for each chapter
    const statuses = [];
    let prevPassed = true; // first level always available

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const prog = _progress[ch.id];

      if (prog && prog.status === 'done') {
        statuses.push('done');
        prevPassed = true;
      } else if (prevPassed && (!prog || prog.status !== 'done')) {
        statuses.push('current');
        prevPassed = false; // only one current at a time
      } else {
        statuses.push('locked');
      }
    }
    return statuses;
  }

  /* ── renderMap ── */
  function renderMap() {
    const container = document.getElementById('game-map');
    if (!container) return;
    const subj = CURRICULUM[_subject];
    const chapters = subj.chapters;
    const statuses = computeNodeStatus(chapters);

    container.innerHTML = '';

    chapters.forEach((ch, i) => {
      const status = statuses[i];

      // Connector above (except first)
      if (i > 0) {
        const connector = document.createElement('div');
        connector.className = 'game-map-connector' + (statuses[i-1]==='done'?' done':'');
        container.appendChild(connector);
      }

      // Node
      const node = document.createElement('div');
      const nodeClass = status === 'done'    ? 'level-node done'
                      : status === 'current' ? 'level-node current'
                      :                        'level-node locked';
      node.className = nodeClass + (ch.type==='quiz'?' quiz':'') + (ch.type==='boss'?' boss':'');
      node.dataset.id = ch.id;
      node.dataset.status = status;
      node.dataset.index = i;

      // Override class for quiz/boss coloring even if locked
      if (ch.type === 'quiz' || ch.type === 'boss') {
        if (status === 'locked') node.className = 'level-node locked';
      }

      const iconEl = document.createElement('div');
      iconEl.className = 'node-icon';
      iconEl.textContent = status === 'locked' ? '🔒' : ch.icon;

      const labelEl = document.createElement('div');
      labelEl.className = 'node-label';
      labelEl.textContent = 'L' + (i+1);

      node.appendChild(iconEl);
      node.appendChild(labelEl);

      // Click handler
      node.addEventListener('click', () => onNodeClick(ch, status, i));

      container.appendChild(node);
    });
  }

  /* ── onNodeClick ── */
  function onNodeClick(ch, status, index) {
    const panel = document.getElementById('level-detail');
    const placeholder = document.getElementById('level-placeholder');
    const content = document.getElementById('level-detail-content');
    if (!panel || !content) return;

    if (status === 'locked') {
      // Show locked modal
      const modal = document.getElementById('locked-modal');
      if (modal) modal.style.display = 'flex';
      return;
    }

    // Hide placeholder, show panel
    if (placeholder) placeholder.style.display = 'none';
    panel.style.display = 'block';

    const prog = _progress[ch.id];
    const scoreHtml = prog && prog.score !== undefined
      ? `<div style="margin:.5rem 0;font-size:.9rem;color:var(--text-muted);">
           Last score: <strong>${prog.score}%</strong>
           &nbsp;|&nbsp; Attempts: <strong>${prog.attempts||1}</strong>
         </div>`
      : '';

    const btnLabel = ch.type === 'lesson' ? 'Start Lesson 📚'
                   : ch.type === 'quiz'   ? 'Take Quiz 📝'
                   :                        'Boss Battle 🏆';

    const btnColor = status === 'done' ? 'btn-outline' : 'btn-primary';

    content.innerHTML = `
      <div style="text-align:center;padding:1.5rem 1rem;">
        <div style="font-size:3.5rem;margin-bottom:.75rem;">${ch.icon}</div>
        <h2 style="margin-bottom:.5rem;">${ch.title}</h2>
        ${scoreHtml}
        <div style="margin:.75rem 0;" class="pill ${status==='done'?'pill-success':status==='current'?'pill-warning':'pill-danger'}">
          ${status==='done'?'✅ Completed':status==='current'?'▶ In Progress':'🔒 Locked'}
        </div>
        <div style="margin:1rem 0;padding:1rem;background:var(--primary-light);border-radius:var(--radius);text-align:left;">
          <div style="font-size:.85rem;font-weight:700;color:var(--primary);margin-bottom:.35rem;">🎯 Rewards</div>
          <div style="font-size:.9rem;">⚡ +${ch.xpReward} XP ${ch.type!=='lesson'?'on pass':''}</div>
          ${ch.passMark?`<div style="font-size:.85rem;color:var(--text-muted);">Pass mark: ${ch.passMark}%</div>`:''}
        </div>
        <button class="btn ${btnColor} btn-full mt-2"
          onclick="GameMap.goToContent('${ch.id}', '${ch.type}')">
          ${btnLabel}
        </button>
        ${status==='done'?`<button class="btn btn-outline btn-full mt-1" style="margin-top:.5rem;" onclick="GameMap.goToContent('${ch.id}','${ch.type}')">Review Again 🔄</button>`:''}
      </div>
    `;
  }

  /* ── goToContent ── */
  function goToContent(chapterId, type) {
    const url = type === 'lesson'
      ? `/student/lesson.html?chapter=${chapterId}&subject=${_subject}`
      : `/student/quiz.html?chapter=${chapterId}&subject=${_subject}`;
    window.location.href = url;
  }

  /* ── markLevelDone (called from lesson/quiz on completion) ── */
  async function markLevelDone(chapterId, score, xpEarned) {
    const prev = _progress[chapterId] || {};
    _progress[chapterId] = {
      status: 'done',
      score: score,
      attempts: (prev.attempts || 0) + 1,
      completedAt: Date.now()
    };

    // Update profile XP
    const currentXP = (_profile.xp || 0) + xpEarned;
    const currentCompleted = (_profile.levelsCompleted || 0) + 1;

    // Persist to Firestore
    try {
      const userRef = firebase.firestore().collection('users').doc(_uid);
      await userRef.update({
        [`progress.${_subject}.${chapterId}`]: _progress[chapterId],
        xp: currentXP,
        levelsCompleted: currentCompleted
      });
    } catch(e) {
      // Fallback to localStorage
      localStorage.setItem(`progress_${_uid}_${_subject}`, JSON.stringify(_progress));
      const profile = JSON.parse(localStorage.getItem(`profile_${_uid}`) || '{}');
      profile.xp = currentXP;
      profile.levelsCompleted = currentCompleted;
      localStorage.setItem(`profile_${_uid}`, JSON.stringify(profile));
    }

    // Check badges
    await BadgeSystem.checkAll(_uid, { xp: currentXP, chapterId, subject: _subject, score, progress: _progress });

    // Show XP popup
    XPSystem.showPopup(xpEarned);
  }

  /* ── renderDailyChallenge ── */
  function renderDailyChallenge() {
    const container = document.getElementById('daily-challenge-widget');
    if (!container) return;

    const todayKey = new Date().toISOString().split('T')[0];
    const dc = DAILY_CHALLENGES[new Date().getDay() % DAILY_CHALLENGES.length];
    const completed = localStorage.getItem(`dc_${_uid}_${todayKey}`) === dc.id;

    container.innerHTML = `
      <div class="card" style="border-left:4px solid var(--accent);background:linear-gradient(135deg,#fffbeb,#fef9ee);">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
          <div style="font-size:2.5rem;">${dc.icon}</div>
          <div style="flex:1;">
            <div style="font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--accent);margin-bottom:.25rem;">🌟 Today's Challenge</div>
            <h4 style="margin-bottom:.2rem;">${dc.title}</h4>
            <p style="font-size:.85rem;color:var(--text-muted);">${dc.desc}</p>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.5rem;font-weight:900;color:var(--accent);">+${dc.xp}</div>
            <div style="font-size:.75rem;color:var(--text-muted);font-weight:700;">XP</div>
          </div>
          ${completed
            ? `<div class="pill pill-success">✅ Done!</div>`
            : `<button class="btn btn-accent btn-sm" onclick="GameMap.claimDailyChallenge('${dc.id}','${dc.xp}','${todayKey}')">Claim!</button>`
          }
        </div>
      </div>
    `;
  }

  /* ── claimDailyChallenge ── */
  async function claimDailyChallenge(dcId, xp, dateKey) {
    localStorage.setItem(`dc_${_uid}_${dateKey}`, dcId);
    XPSystem.showPopup(parseInt(xp));

    // Track daily challenge count for badge
    const dcCount = parseInt(localStorage.getItem(`dc_count_${_uid}`) || '0') + 1;
    localStorage.setItem(`dc_count_${_uid}`, dcCount);

    // Update XP
    try {
      const userRef = firebase.firestore().collection('users').doc(_uid);
      await userRef.update({ xp: firebase.firestore.FieldValue.increment(parseInt(xp)) });
    } catch(e) {
      const p = JSON.parse(localStorage.getItem(`profile_${_uid}`) || '{}');
      p.xp = (p.xp || 0) + parseInt(xp);
      localStorage.setItem(`profile_${_uid}`, JSON.stringify(p));
    }

    renderDailyChallenge();

    if (dcCount >= 3) {
      BadgeSystem.award(_uid, 'daily_3');
    }
  }

  return {
    init,
    goToContent,
    markLevelDone,
    renderDailyChallenge,
    claimDailyChallenge,
    getCurriculum: () => CURRICULUM,
    getProgress:   () => _progress,
  };
})();

/* ── XP System ──────────────────────────────────────────── */
const XPSystem = (() => {

  function showPopup(amount) {
    const el = document.createElement('div');
    el.className = 'xp-popup';
    el.innerHTML = `<span>⚡</span> <span>+${amount} XP!</span>`;
    document.body.appendChild(el);

    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 400);
    }, 2200);
  }

  function showUnlockBurst(levelName) {
    const overlay = document.createElement('div');
    overlay.className = 'unlock-overlay';
    overlay.innerHTML = `
      <div class="unlock-burst">
        <div class="burst-icon">🔓</div>
        <div class="burst-text">Level Unlocked!</div>
        <div style="font-size:1rem;color:var(--text);margin-top:.5rem;">${levelName}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1200);
  }

  // Animated XP counter for dashboard display
  function animateCounter(el, from, to, duration = 1200) {
    if (!el) return;
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const prog = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.round(from + (to - from) * ease);
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  return { showPopup, showUnlockBurst, animateCounter };
})();

/* ── Streak System ──────────────────────────────────────── */
const StreakSystem = (() => {

  async function update(uid) {
    const today = new Date().toISOString().split('T')[0];
    let profile = {};

    try {
      const snap = await firebase.firestore().collection('users').doc(uid).get();
      profile = snap.data() || {};
    } catch(e) {
      profile = JSON.parse(localStorage.getItem(`profile_${uid}`) || '{}');
    }

    const lastLogin  = profile.lastLoginDate || null;
    let   streak     = profile.streak || 0;
    const yesterday  = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastLogin === today) {
      return streak; // Already counted today
    } else if (lastLogin === yesterday) {
      streak += 1;   // Consecutive day
    } else if (!lastLogin) {
      streak = 1;    // First time
    } else {
      streak = 1;    // Streak broken
    }

    const updates = { streak, lastLoginDate: today };

    try {
      await firebase.firestore().collection('users').doc(uid).update(updates);
    } catch(e) {
      const p = JSON.parse(localStorage.getItem(`profile_${uid}`) || '{}');
      Object.assign(p, updates);
      localStorage.setItem(`profile_${uid}`, JSON.stringify(p));
    }

    // Check streak badges
    if (streak >= 3)  BadgeSystem.award(uid, 'streak_3');
    if (streak >= 7)  BadgeSystem.award(uid, 'streak_7');
    if (streak >= 30) BadgeSystem.award(uid, 'streak_30');

    return streak;
  }

  return { update };
})();

/* ── Badge System ───────────────────────────────────────── */
const BadgeSystem = (() => {

  async function award(uid, badgeId) {
    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) return;

    // Check not already awarded
    const alreadyKey = `badge_${uid}_${badgeId}`;
    if (localStorage.getItem(alreadyKey)) return;
    localStorage.setItem(alreadyKey, '1');

    // Persist to Firestore
    try {
      await firebase.firestore().collection('users').doc(uid).update({
        badges: firebase.firestore.FieldValue.arrayUnion(badgeId)
      });
    } catch(e) {
      const p = JSON.parse(localStorage.getItem(`profile_${uid}`) || '{}');
      p.badges = p.badges || [];
      if (!p.badges.includes(badgeId)) p.badges.push(badgeId);
      localStorage.setItem(`profile_${uid}`, JSON.stringify(p));
    }

    // Show popup
    showBadgePopup(badge);
  }

  async function checkAll(uid, { xp, chapterId, subject, score, progress }) {
    // XP milestones
    if (xp >= 500)  award(uid, 'xp_500');
    if (xp >= 1000) award(uid, 'xp_1000');

    // First lesson / quiz
    if (chapterId) {
      const subj = CURRICULUM[subject];
      if (subj) {
        const ch = subj.chapters.find(c => c.id === chapterId);
        if (ch && ch.type === 'lesson') award(uid, 'first_lesson');
        if (ch && (ch.type === 'quiz' || ch.type === 'boss')) {
          award(uid, 'quiz_first');
          if (score === 100) award(uid, 'quiz_perfect');
          if (ch.type === 'boss') award(uid, 'boss_1');
        }
      }
    }

    // Subject depth badges
    if (subject === 'math') {
      const done = Object.values(progress).filter(p => p.status === 'done').length;
      if (done >= 5) award(uid, 'math_5');
    }
    if (['physics','chemistry','biology'].includes(subject)) {
      const done = Object.values(progress).filter(p => p.status === 'done').length;
      if (done >= 5) award(uid, 'science_5');
    }
    if (subject === 'coding') {
      const done = Object.values(progress).filter(p => p.status === 'done').length;
      if (done >= 5) award(uid, 'coding_5');
    }

    // All subjects started
    const allSubjects = Object.keys(CURRICULUM);
    const startedSubjects = [];
    for (const subj of allSubjects) {
      const key = `progress_${uid}_${subj}`;
      const prog = JSON.parse(localStorage.getItem(key) || '{}');
      if (Object.keys(prog).length > 0) startedSubjects.push(subj);
    }
    if (startedSubjects.length >= 5) award(uid, 'all_subjects');
  }

  function showBadgePopup(badge) {
    const overlay = document.createElement('div');
    overlay.className = 'badge-popup-overlay';
    overlay.innerHTML = `
      <div class="badge-popup-card">
        <div class="badge-popup-icon">${badge.icon}</div>
        <h2 style="color:${badge.color};">Badge Earned!</h2>
        <h3 style="margin:.5rem 0;">${badge.name}</h3>
        <p style="color:var(--text-muted);margin-bottom:1.5rem;">${badge.desc}</p>
        <button class="btn btn-primary" onclick="this.closest('.badge-popup-overlay').remove()">
          Awesome! 🎉
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function renderBadgeGrid(containerEl, earnedBadgeIds) {
    if (!containerEl) return;
    containerEl.innerHTML = BADGES.map(b => `
      <div class="badge-item ${earnedBadgeIds.includes(b.id)?'earned':''}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
        <div style="font-size:.72rem;color:var(--text-muted);">${earnedBadgeIds.includes(b.id)?'✅ Earned':'🔒 Locked'}</div>
      </div>
    `).join('');
  }

  return { award, checkAll, showBadgePopup, renderBadgeGrid, BADGES };
})();

/* ── Leaderboard System ─────────────────────────────────── */
const LeaderboardSystem = (() => {

  async function load(classId, uid) {
    let students = [];
    try {
      const snap = await firebase.firestore()
        .collection('users')
        .where('role', '==', 'student')
        .where('class', '==', classId)
        .orderBy('xp', 'desc')
        .limit(10)
        .get();
      snap.forEach(doc => students.push({ id: doc.id, ...doc.data() }));
    } catch(e) {
      // Fallback: mock leaderboard
      students = getMockLeaderboard(uid);
    }
    return students;
  }

  function getMockLeaderboard(uid) {
    return [
      { id: uid,    name: 'You',           xp: parseInt(localStorage.getItem('myXP')||'450'), streak: 7,  class:'9' },
      { id: 'u2',   name: 'Priya Sharma',  xp: 820, streak: 12, class:'9' },
      { id: 'u3',   name: 'Arjun Patel',   xp: 740, streak: 5,  class:'9' },
      { id: 'u4',   name: 'Riya Singh',    xp: 650, streak: 9,  class:'9' },
      { id: 'u5',   name: 'Aditya Kumar',  xp: 580, streak: 3,  class:'9' },
      { id: 'u6',   name: 'Sneha Reddy',   xp: 520, streak: 6,  class:'9' },
      { id: 'u7',   name: 'Rohan Verma',   xp: 480, streak: 2,  class:'9' },
      { id: 'u8',   name: 'Kavya Nair',    xp: 390, streak: 4,  class:'9' },
      { id: 'u9',   name: 'Dev Trivedi',   xp: 310, streak: 1,  class:'9' },
      { id: 'u10',  name: 'Anita Joshi',   xp: 250, streak: 8,  class:'9' },
    ].sort((a,b) => b.xp - a.xp);
  }

  function render(containerEl, students, uid) {
    if (!containerEl) return;
    containerEl.innerHTML = students.map((s, i) => {
      const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
      const rankIcon  = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i+1);
      const isMe = s.id === uid;
      return `
        <div class="leaderboard-item ${isMe?'me':''}">
          <div class="rank-badge ${rankClass}">${rankIcon}</div>
          <div class="user-avatar" style="width:36px;height:36px;font-size:.85rem;background:linear-gradient(135deg,var(--primary),var(--purple));">
            ${s.name.charAt(0)}
          </div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:.9rem;">${s.name}${isMe?' (You)':''}</div>
            <div style="font-size:.75rem;color:var(--text-muted);">🔥 ${s.streak || 0} day streak</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800;color:var(--primary);">${s.xp} XP</div>
          </div>
        </div>
      `;
    }).join('');
  }

  return { load, render, getMockLeaderboard };
})();

/* ── Text-to-Speech ─────────────────────────────────────── */
const TTS = (() => {

  let _speaking = false;
  let _utterance = null;

  function speak(text, lang = 'en-IN') {
    if (!window.speechSynthesis) {
      alert('Text-to-speech not supported on this browser.');
      return;
    }
    if (_speaking) {
      stop();
      return;
    }
    _utterance = new SpeechSynthesisUtterance(text);
    _utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    _utterance.rate = 0.85;
    _utterance.pitch = 1.0;
    _utterance.onstart = () => { _speaking = true; updateBtn(true); };
    _utterance.onend   = () => { _speaking = false; updateBtn(false); };
    _utterance.onerror = () => { _speaking = false; updateBtn(false); };
    window.speechSynthesis.speak(_utterance);
  }

  function stop() {
    window.speechSynthesis.cancel();
    _speaking = false;
    updateBtn(false);
  }

  function updateBtn(active) {
    const btn = document.getElementById('tts-btn');
    if (!btn) return;
    btn.textContent = active ? '🔇 Stop Reading' : '🔊 Read Aloud';
    btn.className = active ? 'btn btn-danger btn-sm' : 'btn btn-outline btn-sm';
  }

  return { speak, stop };
})();

/* ── Confetti Helper ────────────────────────────────────── */
function launchConfetti() {
  const colors = ['#4f46e5','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = `
      position:fixed;
      top:${Math.random()*40}vh;
      left:${Math.random()*100}vw;
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>.5?'50%':'2px'};
      z-index:99999;
      animation:confetti-fall ${1+Math.random()*2}s linear forwards;
      transform:rotate(${Math.random()*360}deg);
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }

  // Inject keyframe if not present
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti-fall {
        to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ── Expose globals ─────────────────────────────────────── */
window.GameMap         = GameMap;
window.XPSystem        = XPSystem;
window.StreakSystem    = StreakSystem;
window.BadgeSystem     = BadgeSystem;
window.LeaderboardSystem = LeaderboardSystem;
window.TTS             = TTS;
window.launchConfetti  = launchConfetti;
window.CURRICULUM      = CURRICULUM;
window.BADGES          = BADGES;
window.DAILY_CHALLENGES = DAILY_CHALLENGES;
