/* ============================================================
   shared.js  —  Central data store using Cloud Firestore
   All pages read/write through DB.*  —  all methods are async.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyB7hmQG7hczx1ohzrR5YAoQQf-9leqy_3g",
  authDomain: "chapel-of-grace-f387c.firebaseapp.com",
  databaseURL: "https://chapel-of-grace-f387c-default-rtdb.firebaseio.com",
  projectId: "chapel-of-grace-f387c",
  storageBucket: "chapel-of-grace-f387c.firebasestorage.app",
  messagingSenderId: "164964093429",
  appId: "1:164964093429:web:ff56c2e183df8012f264bc",
  measurementId: "G-27XFMKP5NE"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const _db = firebase.firestore();

/* ── helpers ── */
const col = name => _db.collection(name);
const docData = d => ({ id: d.id, ...d.data() });

const DB = {

  /* ══════════════════════════════════════════
     PRAYERS
  ══════════════════════════════════════════ */
  async getPrayers() {
    const snap = await col('prayers').orderBy('createdAt', 'desc').get();
    if (!snap.empty) return snap.docs.map(docData);
    return [
      { id: 'seed1', text: "Please pray for my mother's full recovery from surgery.", time: '2 hours ago', initial: 'A', color: '#0b1f4b', prayCount: 0 },
      { id: 'seed2', text: "Seeking God's guidance over a major career decision.", time: '5 hours ago', initial: 'A', color: '#166534', prayCount: 0 },
      { id: 'seed3', text: "Praying for my family's peace and unity.", time: 'Yesterday', initial: 'A', color: '#7c2d12', prayCount: 0 },
    ];
  },

  async addPrayer(text) {
    const colors = ['#0b1f4b','#166534','#7c2d12','#0d2a66','#1a3a7a','#14532d'];
    await col('prayers').add({
      text,
      time: 'Just now',
      initial: 'A',
      color: colors[Math.floor(Math.random() * colors.length)],
      prayCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return this.getPrayers();
  },

  async deletePrayer(id) {
    await col('prayers').doc(id).delete();
    return this.getPrayers();
  },

  async prayFor(id) {
    await col('prayers').doc(id).update({
      prayCount: firebase.firestore.FieldValue.increment(1),
    });
    return this.getPrayers();
  },

  /* ══════════════════════════════════════════
     SERMONS
  ══════════════════════════════════════════ */
  async getSermons() {
    const snap = await col('sermons').orderBy('createdAt', 'desc').get();
    if (!snap.empty) return snap.docs.map(docData);
    return [
      { id: 'seed1', title: 'Walking in Divine Purpose',       speaker: 'Pastor Emmanuel Adeyemi', date: '1 June 2025' },
      { id: 'seed2', title: 'The Power of a Surrendered Life', speaker: 'Pastor Grace Okonkwo',    date: '25 May 2025' },
      { id: 'seed3', title: 'Faith That Moves Mountains',      speaker: 'Pastor Emmanuel Adeyemi', date: '18 May 2025' },
    ];
  },

  async addSermon(data) {
    await col('sermons').add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    return this.getSermons();
  },

  async updateSermon(id, data) {
    await col('sermons').doc(id).update(data);
    return this.getSermons();
  },

  async deleteSermon(id) {
    await col('sermons').doc(id).delete();
    return this.getSermons();
  },

  /* ══════════════════════════════════════════
     ANNOUNCEMENTS
  ══════════════════════════════════════════ */
  async getAnnouncements() {
    const snap = await col('announcements').orderBy('createdAt', 'desc').get();
    if (!snap.empty) return snap.docs.map(docData);
    return [
      { id: 'seed1', emoji: '🙌', tag: 'Worship',    title: 'Combined Thanksgiving Service', body: 'Join us for our end-of-month praise night. All parishes invited.',       date: '29 June 2025', bg: '' },
      { id: 'seed2', emoji: '📖', tag: 'Bible Study', title: 'Midweek Study: Book of Romans', body: 'We continue our deep dive into Romans, Chapter 8. Bring your Bible.',   date: '11 June 2025', bg: 'linear-gradient(135deg,#1a3a7a,#2d5fa8)' },
      { id: 'seed3', emoji: '🌿', tag: 'Outreach',    title: 'Community Food Drive',          body: 'Help us bless our neighbours. Donations accepted at the church office.', date: '15 June 2025', bg: 'linear-gradient(135deg,#0b3d2e,#166534)' },
    ];
  },

  async addAnnouncement(data) {
    await col('announcements').add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    return this.getAnnouncements();
  },

  async updateAnnouncement(id, data) {
    await col('announcements').doc(id).update(data);
    return this.getAnnouncements();
  },

  async deleteAnnouncement(id) {
    await col('announcements').doc(id).delete();
    return this.getAnnouncements();
  },

  /* ══════════════════════════════════════════
     HOME CARDS
  ══════════════════════════════════════════ */
  async getHomeCards() {
    const snap = await col('homeCards').get();
    if (!snap.empty) return snap.docs.map(docData);
    return [
      { id: 'prayer',  emoji: '🙏', label: 'Daily Prayer', content: 'Lord, guide my steps today. Grant me wisdom, peace, and faith. Amen.' },
      { id: 'bible',   emoji: '📖', label: 'Bible Plan',   content: "Today's reading: Romans 8:1–17 — Life in the Spirit." },
      { id: 'worship', emoji: '🎵', label: 'Worship',      content: 'Song of the week: "Great Are You Lord" — All Sons & Daughters.' },
    ];
  },

  async updateHomeCard(id, data) {
    await col('homeCards').doc(id).set(data, { merge: true });
    return this.getHomeCards();
  },

  /* ══════════════════════════════════════════
     WORKER REGISTRATIONS
  ══════════════════════════════════════════ */
  async getRegistrations() {
    const snap = await col('registrations').orderBy('createdAt', 'desc').get();
    return snap.docs.map(docData);
  },

  async addRegistration(data) {
    await col('registrations').add({
      ...data,
      status: 'pending',
      submittedAt: new Date().toLocaleString(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return this.getRegistrations();
  },

  async updateRegistrationStatus(id, status) {
    await col('registrations').doc(id).update({ status });
    return this.getRegistrations();
  },

  async deleteRegistration(id) {
    await col('registrations').doc(id).delete();
    return this.getRegistrations();
  },
};
