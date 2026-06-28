/* admin.js */

/* ── AUTH ── */
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'grace2024';
const SESSION_KEY    = 'cog_admin_auth';

(function initAuth() {
  const overlay    = document.getElementById('loginOverlay');
  const loginBtn   = document.getElementById('loginBtn');
  const logoutBtn  = document.getElementById('logoutBtn');
  const loginError = document.getElementById('loginError');
  const eyeBtn     = document.getElementById('loginEyeBtn');
  const eyeIcon    = document.getElementById('loginEyeIcon');
  const pwInput    = document.getElementById('loginPassword');

  function showDashboard() { overlay.classList.add('hidden'); }
  function showLogin()     { overlay.classList.remove('hidden'); }

  if (localStorage.getItem(SESSION_KEY) === '1') showDashboard();

  function attemptLogin() {
    const user = document.getElementById('loginUsername').value.trim();
    const pass = pwInput.value;
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      loginError.classList.remove('visible');
      localStorage.setItem(SESSION_KEY, '1');
      showDashboard();
    } else {
      loginError.classList.add('visible');
      pwInput.value = '';
      pwInput.focus();
    }
  }

  loginBtn.addEventListener('click', attemptLogin);
  ['loginUsername', 'loginPassword'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') attemptLogin();
    });
  });

  eyeBtn.addEventListener('click', () => {
    const isHidden = pwInput.type === 'password';
    pwInput.type = isHidden ? 'text' : 'password';
    eyeIcon.className = isHidden ? 'bi bi-eye-slash' : 'bi bi-eye';
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    showLogin();
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
  });
})();

/* ── PANEL SWITCHING ── */
function switchPanel(id) {
  document.querySelectorAll('.adm-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.adm-nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  document.querySelectorAll(`.adm-nav-btn[data-panel="${id}"]`).forEach(b => b.classList.add('active'));
  document.getElementById('mobileDrawer').classList.remove('open');
}

document.querySelectorAll('.adm-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});

document.getElementById('mobileMenuBtn').addEventListener('click', () => {
  document.getElementById('mobileDrawer').classList.toggle('open');
});

/* ── CONFIRM MODAL ── */
let pendingDeleteFn = null;
function showConfirm(title, body, onOk) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmBody').textContent  = body;
  document.getElementById('confirmBackdrop').style.display = 'flex';
  pendingDeleteFn = onOk;
}
document.getElementById('confirmCancel').addEventListener('click', () => {
  document.getElementById('confirmBackdrop').style.display = 'none';
  pendingDeleteFn = null;
});
document.getElementById('confirmOk').addEventListener('click', () => {
  if (pendingDeleteFn) pendingDeleteFn();
  document.getElementById('confirmBackdrop').style.display = 'none';
  pendingDeleteFn = null;
});

/* ══════════════════════════════════════════
   PRAYERS
══════════════════════════════════════════ */
async function renderPrayers() {
  const el   = document.getElementById('prayerList');
  el.innerHTML = '<div class="adm-empty"><i class="bi bi-arrow-clockwise"></i> Loading…</div>';
  const list = await DB.getPrayers();
  if (!list.length) {
    el.innerHTML = '<div class="adm-empty"><i class="bi bi-hands"></i>No prayer requests yet.</div>';
    return;
  }
  el.innerHTML = list.map(p => `
    <div class="adm-item">
      <div class="adm-item-icon">🙏</div>
      <div class="adm-item-body">
        <div class="adm-item-sub">Anonymous · ${p.time} · ${p.prayCount || 0} praying</div>
        <div class="adm-item-text">${p.text}</div>
      </div>
      <div class="adm-item-actions">
        <button class="adm-del-btn" data-id="${p.id}" title="Remove"><i class="bi bi-trash3"></i></button>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.adm-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      showConfirm('Remove prayer request?', 'This will delete it from the Members portal.', async () => {
        await DB.deletePrayer(id);
        renderPrayers();
      });
    });
  });
}

/* ══════════════════════════════════════════
   SERMONS
══════════════════════════════════════════ */
let editingSermonId = null;
let _sermonCache = [];

async function renderSermons() {
  const el = document.getElementById('sermonList');
  el.innerHTML = '<div class="adm-empty"><i class="bi bi-arrow-clockwise"></i> Loading…</div>';
  const list = await DB.getSermons();
  _sermonCache = list;
  if (!list.length) {
    el.innerHTML = '<div class="adm-empty"><i class="bi bi-mic"></i>No sermons yet. Add one above.</div>';
    return;
  }
  el.innerHTML = list.map(s => `
    <div class="adm-item">
      <div class="adm-item-icon"><i class="bi bi-music-note-beamed" style="color:var(--gold)"></i></div>
      <div class="adm-item-body">
        <div class="adm-item-title">${s.title}</div>
        <div class="adm-item-sub">${s.speaker} · ${s.date}</div>
      </div>
      <div class="adm-item-actions">
        <button class="adm-edit-btn" data-id="${s.id}" title="Edit"><i class="bi bi-pencil"></i></button>
        <button class="adm-del-btn"  data-id="${s.id}" title="Delete"><i class="bi bi-trash3"></i></button>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.adm-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = _sermonCache.find(x => x.id === btn.dataset.id);
      if (!s) return;
      editingSermonId = s.id;
      document.getElementById('sf_title').value   = s.title;
      document.getElementById('sf_speaker').value = s.speaker;
      document.getElementById('sf_date').value    = s.date;
      document.getElementById('sermonFormTitle').textContent = 'Edit Sermon';
      document.getElementById('sermonForm').style.display = 'block';
    });
  });

  el.querySelectorAll('.adm-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      showConfirm('Delete sermon?', 'This will remove it from the Members portal.', async () => {
        await DB.deleteSermon(id);
        renderSermons();
      });
    });
  });
}

document.getElementById('addSermonBtn').addEventListener('click', () => {
  editingSermonId = null;
  ['sf_title','sf_speaker','sf_date'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('sermonFormTitle').textContent = 'Add Sermon';
  document.getElementById('sermonForm').style.display = 'block';
});

document.getElementById('sermonCancelBtn').addEventListener('click', () => {
  document.getElementById('sermonForm').style.display = 'none';
  editingSermonId = null;
});

document.getElementById('sermonSaveBtn').addEventListener('click', async () => {
  const data = {
    title:   document.getElementById('sf_title').value.trim(),
    speaker: document.getElementById('sf_speaker').value.trim(),
    date:    document.getElementById('sf_date').value.trim(),
  };
  if (!data.title || !data.speaker) return alert('Please fill in Title and Speaker.');
  if (editingSermonId) {
    await DB.updateSermon(editingSermonId, data);
  } else {
    await DB.addSermon(data);
  }
  document.getElementById('sermonForm').style.display = 'none';
  editingSermonId = null;
  renderSermons();
});

/* ══════════════════════════════════════════
   ANNOUNCEMENTS
══════════════════════════════════════════ */
let editingAnnouncementId = null;
let _announcementCache = [];

async function renderAnnouncements() {
  const el = document.getElementById('announcementList');
  el.innerHTML = '<div class="adm-empty"><i class="bi bi-arrow-clockwise"></i> Loading…</div>';
  const list = await DB.getAnnouncements();
  _announcementCache = list;
  if (!list.length) {
    el.innerHTML = '<div class="adm-empty"><i class="bi bi-megaphone"></i>No announcements yet. Add one above.</div>';
    return;
  }
  el.innerHTML = list.map(a => `
    <div class="adm-item">
      <div class="adm-item-icon">${a.emoji}</div>
      <div class="adm-item-body">
        <div class="adm-item-tag">${a.tag}</div>
        <div class="adm-item-title">${a.title}</div>
        <div class="adm-item-sub">${a.body}</div>
        <div class="adm-item-sub" style="margin-top:4px"><i class="bi bi-calendar3"></i> ${a.date}</div>
      </div>
      <div class="adm-item-actions">
        <button class="adm-edit-btn" data-id="${a.id}" title="Edit"><i class="bi bi-pencil"></i></button>
        <button class="adm-del-btn"  data-id="${a.id}" title="Delete"><i class="bi bi-trash3"></i></button>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.adm-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = _announcementCache.find(x => x.id === btn.dataset.id);
      if (!a) return;
      editingAnnouncementId = a.id;
      document.getElementById('af_emoji').value = a.emoji;
      document.getElementById('af_tag').value   = a.tag;
      document.getElementById('af_title').value = a.title;
      document.getElementById('af_body').value  = a.body;
      document.getElementById('af_date').value  = a.date;
      document.getElementById('announcementFormTitle').textContent = 'Edit Announcement';
      document.getElementById('announcementForm').style.display = 'block';
    });
  });

  el.querySelectorAll('.adm-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      showConfirm('Delete announcement?', 'This will remove it from the Members portal.', async () => {
        await DB.deleteAnnouncement(id);
        renderAnnouncements();
      });
    });
  });
}

document.getElementById('addAnnouncementBtn').addEventListener('click', () => {
  editingAnnouncementId = null;
  ['af_emoji','af_tag','af_title','af_body','af_date'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('announcementFormTitle').textContent = 'Add Announcement';
  document.getElementById('announcementForm').style.display = 'block';
});

document.getElementById('announcementCancelBtn').addEventListener('click', () => {
  document.getElementById('announcementForm').style.display = 'none';
  editingAnnouncementId = null;
});

document.getElementById('announcementSaveBtn').addEventListener('click', async () => {
  const data = {
    emoji: document.getElementById('af_emoji').value.trim() || '📢',
    tag:   document.getElementById('af_tag').value.trim()   || 'General',
    title: document.getElementById('af_title').value.trim(),
    body:  document.getElementById('af_body').value.trim(),
    date:  document.getElementById('af_date').value.trim(),
    bg:    '',
  };
  if (!data.title || !data.body) return alert('Please fill in Title and Body.');
  if (editingAnnouncementId) {
    await DB.updateAnnouncement(editingAnnouncementId, data);
  } else {
    await DB.addAnnouncement(data);
  }
  document.getElementById('announcementForm').style.display = 'none';
  editingAnnouncementId = null;
  renderAnnouncements();
});

/* ══════════════════════════════════════════
   HOME CARDS
══════════════════════════════════════════ */
async function renderHomeCards() {
  const el   = document.getElementById('homeCardList');
  el.innerHTML = '<div class="adm-empty"><i class="bi bi-arrow-clockwise"></i> Loading…</div>';
  const list = await DB.getHomeCards();
  el.innerHTML = list.map(c => `
    <div class="adm-item" style="flex-direction:column;align-items:stretch">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="adm-item-icon">${c.emoji}</div>
        <div class="adm-item-title">${c.label}</div>
      </div>
      <div class="adm-homecard-edit">
        <label style="font-size:12px;font-weight:600;color:#374151">Content shown to members:</label>
        <textarea rows="3" id="hc_${c.id}">${c.content}</textarea>
        <button class="adm-homecard-save" data-card-id="${c.id}">Save</button>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.adm-homecard-save').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cardId  = btn.dataset.cardId;
      const content = document.getElementById('hc_' + cardId).value.trim();
      if (!content) return;
      await DB.updateHomeCard(cardId, { content });
      btn.textContent = '✓ Saved';
      setTimeout(() => btn.textContent = 'Save', 1500);
    });
  });
}

/* ══════════════════════════════════════════
   WORKER REGISTRATIONS
══════════════════════════════════════════ */
async function renderRegistrations() {
  const el = document.getElementById('registrationList');
  el.innerHTML = '<div class="adm-empty"><i class="bi bi-arrow-clockwise"></i> Loading…</div>';
  const list = await DB.getRegistrations();
  if (!list.length) {
    el.innerHTML = '<div class="adm-empty"><i class="bi bi-person-lines-fill"></i>No applications yet.</div>';
    return;
  }
  el.innerHTML = list.map(r => `
    <div class="adm-item">
      <div class="adm-item-icon">👤</div>
      <div class="adm-item-body">
        <div class="adm-item-title">
          ${r.fullName}
          <span class="status-badge status-${r.status}">${r.status}</span>
        </div>
        <div class="adm-item-sub">${r.department} · ${r.phone}</div>
        <div class="adm-item-sub">${r.email}</div>
        <div class="adm-item-text">${r.reason}</div>
        <div class="adm-item-sub" style="margin-top:6px;font-size:11px">Submitted: ${r.submittedAt}</div>
      </div>
      <div class="adm-item-actions" style="flex-direction:column">
        ${r.status === 'pending' ? `
          <button class="adm-approve-btn" data-id="${r.id}">Approve</button>
          <button class="adm-reject-btn"  data-id="${r.id}">Reject</button>
        ` : ''}
        <button class="adm-del-btn" data-id="${r.id}" title="Delete"><i class="bi bi-trash3"></i></button>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.adm-approve-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await DB.updateRegistrationStatus(btn.dataset.id, 'approved');
      renderRegistrations();
    });
  });
  el.querySelectorAll('.adm-reject-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await DB.updateRegistrationStatus(btn.dataset.id, 'rejected');
      renderRegistrations();
    });
  });
  el.querySelectorAll('.adm-del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      showConfirm('Delete application?', 'This will permanently remove this record.', async () => {
        await DB.deleteRegistration(id);
        renderRegistrations();
      });
    });
  });
}

/* ── INIT ── */
renderPrayers();
renderSermons();
renderAnnouncements();
renderHomeCards();
renderRegistrations();
