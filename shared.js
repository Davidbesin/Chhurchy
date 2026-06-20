/* ============================================================
   shared.js  —  Central data store using localStorage
   All pages read/write through these helpers so data is
   consistent across Admin, Members, and Workers pages.
   ============================================================ */

const DB = {

  /* ── KEYS ── */
  KEYS: {
    prayers:       'cog_prayers',
    sermons:       'cog_sermons',
    announcements: 'cog_announcements',
    registrations: 'cog_registrations',
    homeCards:     'cog_home_cards',
  },

  /* ── GENERIC ── */
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; }
    catch { return null; }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },

  /* ── PRAYERS ── */
  getPrayers() {
    return this.get(this.KEYS.prayers) || [
      { id: 1, text: "Please pray for my mother's full recovery from surgery. We trust in God's healing power.", time: "2 hours ago", initial: "A" , color: "#0b1f4b", prayCount: 0 },
      { id: 2, text: "Seeking God's guidance over a major career decision. Please join me in prayer for clarity.", time: "5 hours ago", initial: "A", color: "#166534", prayCount: 0 },
      { id: 3, text: "Praying for my family's peace and unity. Things have been hard lately and we need God's grace.", time: "Yesterday",  initial: "A", color: "#7c2d12", prayCount: 0 },
    ];
  },
  savePrayers(list) { this.set(this.KEYS.prayers, list); },
  addPrayer(text) {
    const list = this.getPrayers();
    const colors = ["#0b1f4b","#166534","#7c2d12","#0d2a66","#1a3a7a","#14532d"];
    list.unshift({
      id: Date.now(),
      text,
      time: "Just now",
      initial: "A",
      color: colors[Math.floor(Math.random() * colors.length)],
      prayCount: 0,
    });
    this.savePrayers(list);
    return list;
  },
  deletePrayer(id) {
    const list = this.getPrayers().filter(p => p.id !== id);
    this.savePrayers(list);
    return list;
  },
  prayFor(id) {
    const list = this.getPrayers().map(p => p.id === id ? { ...p, prayCount: (p.prayCount||0) + 1 } : p);
    this.savePrayers(list);
    return list;
  },

  /* ── SERMONS ── */
  getSermons() {
    return this.get(this.KEYS.sermons) || [
      { id: 1, title: "Walking in Divine Purpose",       speaker: "Pastor Emmanuel Adeyemi", date: "1 June 2025" },
      { id: 2, title: "The Power of a Surrendered Life", speaker: "Pastor Grace Okonkwo",    date: "25 May 2025" },
      { id: 3, title: "Faith That Moves Mountains",      speaker: "Pastor Emmanuel Adeyemi", date: "18 May 2025" },
    ];
  },
  saveSermons(list) { this.set(this.KEYS.sermons, list); },
  addSermon(data) {
    const list = this.getSermons();
    list.unshift({ id: Date.now(), ...data });
    this.saveSermons(list);
    return list;
  },
  updateSermon(id, data) {
    const list = this.getSermons().map(s => s.id === id ? { ...s, ...data } : s);
    this.saveSermons(list);
    return list;
  },
  deleteSermon(id) {
    const list = this.getSermons().filter(s => s.id !== id);
    this.saveSermons(list);
    return list;
  },

  /* ── ANNOUNCEMENTS ── */
  getAnnouncements() {
    return this.get(this.KEYS.announcements) || [
      { id: 1, emoji: "🙌", tag: "Worship",    title: "Combined Thanksgiving Service",  body: "Join us for our end-of-month praise night. All parishes invited.",              date: "29 June 2025", bg: "" },
      { id: 2, emoji: "📖", tag: "Bible Study", title: "Midweek Study: Book of Romans",  body: "We continue our deep dive into Romans, Chapter 8. Bring your Bible.",           date: "11 June 2025", bg: "linear-gradient(135deg,#1a3a7a,#2d5fa8)" },
      { id: 3, emoji: "🌿", tag: "Outreach",    title: "Community Food Drive",           body: "Help us bless our neighbours. Donations accepted at the church office.",         date: "15 June 2025", bg: "linear-gradient(135deg,#0b3d2e,#166534)" },
    ];
  },
  saveAnnouncements(list) { this.set(this.KEYS.announcements, list); },
  addAnnouncement(data) {
    const list = this.getAnnouncements();
    list.unshift({ id: Date.now(), ...data });
    this.saveAnnouncements(list);
    return list;
  },
  updateAnnouncement(id, data) {
    const list = this.getAnnouncements().map(a => a.id === id ? { ...a, ...data } : a);
    this.saveAnnouncements(list);
    return list;
  },
  deleteAnnouncement(id) {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    this.saveAnnouncements(list);
    return list;
  },

  /* ── HOME CARDS ── */
  getHomeCards() {
    return this.get(this.KEYS.homeCards) || [
      { id: 'prayer',  emoji: "🙏", label: "Daily Prayer",  content: "Lord, guide my steps today. Grant me wisdom, peace, and faith. Amen." },
      { id: 'bible',   emoji: "📖", label: "Bible Plan",    content: "Today's reading: Romans 8:1–17 — Life in the Spirit." },
      { id: 'worship', emoji: "🎵", label: "Worship",       content: "Song of the week: \"Great Are You Lord\" — All Sons & Daughters." },
    ];
  },
  saveHomeCards(list) { this.set(this.KEYS.homeCards, list); },
  updateHomeCard(id, data) {
    const list = this.getHomeCards().map(c => c.id === id ? { ...c, ...data } : c);
    this.saveHomeCards(list);
    return list;
  },

  /* ── WORKER REGISTRATIONS ── */
  getRegistrations() { return this.get(this.KEYS.registrations) || []; },
  addRegistration(data) {
    const list = this.getRegistrations();
    list.unshift({ id: Date.now(), submittedAt: new Date().toLocaleString(), status: 'pending', ...data });
    this.set(this.KEYS.registrations, list);
    return list;
  },
  updateRegistrationStatus(id, status) {
    const list = this.getRegistrations().map(r => r.id === id ? { ...r, status } : r);
    this.set(this.KEYS.registrations, list);
    return list;
  },
  deleteRegistration(id) {
    const list = this.getRegistrations().filter(r => r.id !== id);
    this.set(this.KEYS.registrations, list);
    return list;
  },
};
