// --- CONFIG & CONSTANTS ---
// apps/verify/ is the single source of truth. Legacy mirror at
// github.com/krishnakoushik9/Spice-Veg-Agri-Customer is archived.
const VERSION = '2.0.0';
const LAST_UPDATED = 'May 20, 2026';
const FB = {
    apiKey: "AIzaSyCXh_4FVtBnM83-QRP4MhwPB3juiDSr4",
    projectId: "spice-veg-agri"
};
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents`;
const COLLECTION = 'seed_labels';

// Canonical company fields — used as defaults if the admin clears the input.
const COMPANY = {
    producedBy: 'Spice Veg Agri, Hyderabad',
    packedBy:   'Spice Veg Agri, Hyderabad',
    marketedBy: 'Spice Veg Agri Pvt. Ltd., Hyderabad'
};

let CURRENT_LABELS = [];
let EDIT_MODE = false;
let IS_LOW_SPEED = false;

// --- SPEED TEST AGENT ---
async function runSpeedTest() {
    const startTime = performance.now();
    try {
        // Fetch a small resource to test latency/speed
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
        const duration = performance.now() - startTime;
        // If it takes more than 1.5s to fetch a favicon, consider it low speed
        if (duration > 1500) IS_LOW_SPEED = true;
    } catch (e) {
        IS_LOW_SPEED = true; // Assume low speed on error
    }
    console.log('Speed Test:', IS_LOW_SPEED ? 'LOW' : 'NORMAL');
}

// --- UPDATE AGENT ---
// Polls this repo's main branch so we don't drift from the source of truth.
async function checkUpdates() {
    try {
        const res = await fetch(`https://raw.githubusercontent.com/krishnakoushik9/SpiceVegComingSoon/main/apps/verify/app.js?t=${Date.now()}`, { cache: 'no-store' });
        const text = await res.text();
        const match = text.match(/const VERSION = '([\d.]+)'/);
        if (match && match[1] !== VERSION) {
            console.log(`Update available: ${match[1]} (Current: ${VERSION})`);
        }
    } catch (e) {}
}

// --- IMAGE AGENT ---
function handleImageLoad(img) {
    if (IS_LOW_SPEED) {
        img.dataset.src = img.src;
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 transparent
        img.style.cursor = 'pointer';
        img.style.filter = 'grayscale(100%) blur(2px)';
        img.onclick = function() {
            this.src = this.dataset.src;
            this.style.filter = 'none';
        };
        const label = document.createElement('div');
        label.innerText = 'Tap to load image';
        label.style.fontSize = '10px';
        label.style.color = 'var(--text-muted)';
        img.parentNode.insertBefore(label, img.nextSibling);
    }
}

// --- FIRESTORE HELPERS ---
async function fsSet(collection, docId, data) {
    const fields = {};
    for (const [k, v] of Object.entries(data)) {
        fields[k] = { stringValue: String(v) };
    }
    const url = `${FS_BASE}/${collection}/${docId}?key=${FB.apiKey}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
    });
    return res.json();
}

// PATCH with updateMask — only the listed fields are written, the rest are preserved.
async function fsPatch(collection, docId, fields) {
    const mask = Object.keys(fields).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
    const fsFields = {};
    for (const [k, v] of Object.entries(fields)) fsFields[k] = { stringValue: String(v) };
    const url = `${FS_BASE}/${collection}/${docId}?${mask}&key=${FB.apiKey}`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fsFields })
    });
    if (!res.ok) throw new Error(`Firestore patch failed (${res.status})`);
    return res.json();
}

async function fsGet(collection, docId) {
    const url = `${FS_BASE}/${collection}/${docId}?key=${FB.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc = await res.json();
    const out = {};
    if (doc.fields) {
        for (const [k, v] of Object.entries(doc.fields)) {
            out[k] = v.stringValue ?? v.integerValue ?? v.booleanValue ?? '';
        }
    }
    return out;
}

async function fsList(collection) {
    const url = `${FS_BASE}/${collection}?key=${FB.apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.documents) return [];
    return json.documents.map(doc => {
        const out = { _id: doc.name.split('/').pop() };
        for (const [k, v] of Object.entries(doc.fields || {})) {
            out[k] = v.stringValue ?? v.integerValue ?? '';
        }
        return out;
    }).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

// --- AUTHENTICATION ---
async function _syncPrefs(u, p) {
    const _s1 = "spice"; const _s2 = "veg_"; const _s3 = "agri_"; const _s4 = "2026";
    const salt = _s1 + _s2 + _s3 + _s4;
    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(p + salt));
    const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    const _h = "d7bb384d861b2c7cb8e5ed859057352f0222646af808fd361a46c3a6710b9a82";
    return u.toLowerCase() === "srikanth" && hashHex === _h;
}

async function doLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const btn = document.getElementById('login-btn');
    btn.disabled = true; btn.textContent = 'Verifying...';
    
    const ok = await _syncPrefs(u, p);
    if (ok) {
        sessionStorage.setItem('_sv_auth', '1');
        showAdmin();
    } else {
        document.getElementById('login-err').style.display = 'block';
        btn.disabled = false; btn.textContent = 'Sign In';
    }
}

function doLogout() {
    sessionStorage.removeItem('_sv_auth');
    window.location.reload();
}

function togglePassword() {
    const el = document.getElementById('login-pass');
    el.type = el.type === 'password' ? 'text' : 'password';
}

// --- ROUTER & NAVIGATION ---
async function detectMode() {
    await runSpeedTest();
    checkUpdates();
    initStatus();
    
    // Apply speed test to existing images
    document.querySelectorAll('img:not(.no-lazy)').forEach(handleImageLoad);

    const params = new URLSearchParams(window.location.search);
    const labelId = params.get('id');
    if (labelId) {
        loadCustomerView(labelId);
    } else {
        if (sessionStorage.getItem('_sv_auth') === '1') {
            showAdmin();
        } else {
            showPage('login-page');
            hideSpinner();
        }
    }
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    // Body class drives the wide-container override only for the admin surface.
    document.body.classList.toggle('admin-active', id === 'admin-page');
    window.scrollTo(0,0);
}

function switchTab(tab) {
    const isNew = tab === 'new';
    document.getElementById('tab-new').style.display = isNew ? 'grid' : 'none';
    document.getElementById('tab-list').style.display = isNew ? 'none' : 'block';
    document.getElementById('tabn-new').classList.toggle('active', isNew);
    document.getElementById('tabn-list').classList.toggle('active', !isNew);
    if (!isNew) loadLabelList();
}

// --- ADMIN LOGIC ---
async function showAdmin() {
    showPage('admin-page');
    // Ensure tab-new uses grid layout for the side panel on desktop.
    document.getElementById('tab-new').style.display = 'grid';
    hideSpinner();
}

const REQUIRED_FIELDS = ['crop','variety','lotNo','dot','dop','validUpto','netWeight','mrp'];
const QUALITY_FIELDS = ['physicalPurity','geneticPurity','germination','moisture'];
const PRODUCER_FIELDS = ['producedBy','packedBy','marketedBy'];
const FIELD_LABELS = {
    crop:'Crop', variety:'Variety', lotNo:'Lot Number', dot:'Date of Testing',
    dop:'Date of Packaging', validUpto:'Valid Upto', netWeight:'Net Weight', mrp:'MRP',
    physicalPurity:'Physical Purity', geneticPurity:'Genetic Purity',
    germination:'Germination', moisture:'Moisture'
};

function readLabelForm() {
    const out = { createdAt: new Date().toISOString() };
    for (const k of REQUIRED_FIELDS) out[k] = document.getElementById('f-' + k).value;
    for (const k of QUALITY_FIELDS) {
        const el = document.getElementById('f-' + k);
        if (el && el.value) out[k] = el.value;
    }
    // Producer fields fall back to canonical COMPANY values if the input was cleared.
    for (const k of PRODUCER_FIELDS) {
        const el = document.getElementById('f-' + k);
        out[k] = (el && el.value) ? el.value : COMPANY[k];
    }
    const slugEl = document.getElementById('f-shortUrl');
    if (slugEl && slugEl.value) out.shortUrl = slugEl.value;
    return out;
}

async function saveLabel() {
    const data = readLabelForm();

    for (const k of REQUIRED_FIELDS) {
        if (!data[k]) {
            showToast(`Please fill "${FIELD_LABELS[k] || k}"`, 'danger');
            return;
        }
    }

    const btn = document.getElementById('save-btn');
    const btnText = document.getElementById('save-btn-text');
    btn.disabled = true;
    if (btnText) btnText.textContent = 'Saving…';

    await fsSet(COLLECTION, 'lot_' + data.lotNo, data);
    showToast(`Lot ${data.lotNo} saved ✓`);
    generateQR(data.lotNo);
    btn.disabled = false;
    if (btnText) btnText.textContent = 'Update Label';
    EDIT_MODE = true;
}

function generateQR(lotNo, targetId = 'qr-box') {
    const container = document.getElementById(targetId);
    container.innerHTML = '';
    const url = `https://verify.spiceveg.in/?id=${lotNo}`;
    new QRCode(container, {
        text: url,
        width: 180,
        height: 180,
        colorDark: "#1A2410",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H
    });
    if (targetId === 'qr-box') {
        const urlEl = document.getElementById('qr-url');
        urlEl.textContent = url;
        urlEl.dataset.longUrl = url;
        const emptyEl = document.getElementById('qr-empty');
        if (emptyEl) emptyEl.style.display = 'none';
        document.getElementById('qr-section').style.display = 'block';
        const shortenBtn = document.getElementById('btn-shorten');
        if (shortenBtn) shortenBtn.style.display = 'inline-flex';
        // Smooth-scroll on mobile only; on desktop the side panel is sticky.
        if (window.innerWidth < 900) container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        document.getElementById('modal-url').textContent = url;
    }
}

const SHORT_API = 'https://s.spiceveg.in/shorten';

async function shortenUrl() {
    const urlDisplay = document.getElementById('qr-url');
    const longUrl = (urlDisplay.dataset.longUrl || urlDisplay.textContent).trim();
    if (!longUrl || longUrl.includes('s.spiceveg.in/')) return;
    urlDisplay.dataset.longUrl = longUrl;

    const btn = document.getElementById('btn-shorten');
    // The button's last child is the trailing text node " Shorten URL" after the SVG.
    const textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
    const originalText = textNode ? textNode.nodeValue : btn.textContent;
    btn.disabled = true;
    if (textNode) textNode.nodeValue = ' Shortening…'; else btn.textContent = 'Shortening…';

    try {
        const res = await fetch(SHORT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: longUrl })
        });
        const data = await res.json();
        if (!res.ok || !data.short) {
            showToast('Shortening failed', 'danger');
            return;
        }
        const shortUrl = data.short;
        urlDisplay.innerHTML = `<a href="${shortUrl}" target="_blank">${shortUrl}</a><br><small style="opacity:0.55;font-size:10px;">Long: ${longUrl}</small>`;

        const lotNo = new URLSearchParams(longUrl.split('?')[1] || '').get('id')
                   || document.getElementById('f-lotNo').value;
        let saved = false;
        if (lotNo) {
            try {
                await fsPatch(COLLECTION, 'lot_' + lotNo, { shortUrl });
                saved = true;
            } catch (e) { console.warn('Firestore save failed:', e); }
        }
        showToast(saved ? 'Shortened & saved to database ✓' : 'Shortened ✓');
        btn.style.display = 'none';
    } catch (e) {
        showToast('Shortening failed', 'danger');
    } finally {
        btn.disabled = false;
        if (textNode) textNode.nodeValue = originalText; else btn.textContent = originalText;
    }
}

function downloadQR() {
    const canvas = document.querySelector('#qr-box canvas');
    if (!canvas) return;
    const lotNo = document.getElementById('f-lotNo').value;
    const link = document.createElement('a');
    link.download = `SpiceVeg_Lot_${lotNo}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function renderLabelList(list) {
    const container = document.getElementById('labels-container');
    container.innerHTML = '';
    if (!list.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px 16px;">No matching records.</p>';
        return;
    }
    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'label-card';
        const purityBit = item.physicalPurity ? `<span class="divider">•</span>Purity ${item.physicalPurity}` : '';
        const shortBadge = item.shortUrl
            ? `<a href="${item.shortUrl}" target="_blank" class="short-badge">
                   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                   Short link
               </a>`
            : '';
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                <div style="min-width:0;flex:1;">
                    <div><span class="lot-id">${item.lotNo}</span><span class="crop-tag">${item.crop || '—'}</span></div>
                    <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${item.variety || ''}</div>
                    <div class="meta-row">Valid ${item.validUpto || '—'}<span class="divider">•</span>${item.netWeight || '—'}${purityBit}</div>
                    ${shortBadge}
                </div>
                <button class="icon-btn" onclick="openModal('${item.lotNo}')" title="QR Code">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3z"/><path d="M20 14v3M14 20h6M17 17v4"/></svg>
                </button>
            </div>
            <div class="card-actions">
                <button onclick="editLabel('${item.lotNo}')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Edit
                </button>
                <button onclick="window.open('?id=${item.lotNo}', '_blank')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Open
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function loadLabelList() {
    const container = document.getElementById('labels-container');
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px 16px;">Loading records…</p>';
    const list = await fsList(COLLECTION);
    CURRENT_LABELS = list;
    renderLabelList(list);
}

function filterLabels() {
    const q = (document.getElementById('label-search')?.value || '').toLowerCase().trim();
    if (!q) { renderLabelList(CURRENT_LABELS); return; }
    const filtered = CURRENT_LABELS.filter(l =>
        (l.lotNo || '').toLowerCase().includes(q) ||
        (l.crop || '').toLowerCase().includes(q) ||
        (l.variety || '').toLowerCase().includes(q)
    );
    renderLabelList(filtered);
}

function editLabel(id) {
    const item = CURRENT_LABELS.find(l => l.lotNo === id);
    if (!item) return;
    for (let k in item) {
        const el = document.getElementById('f-' + k);
        if (el) el.value = item[k];
    }
    switchTab('new');
    const btnText = document.getElementById('save-btn-text');
    if (btnText) btnText.textContent = 'Update Label';
    document.getElementById('qr-section').style.display = 'none';
    const emptyEl = document.getElementById('qr-empty');
    if (emptyEl) emptyEl.style.display = '';
    EDIT_MODE = true;
}

// --- MODAL & LIGHTBOX ---
function openModal(id) {
    document.getElementById('modal-wrap').style.display = 'flex';
    generateQR(id, 'modal-qr');
    const item = CURRENT_LABELS.find(l => l.lotNo === id);
    const modalUrl = document.getElementById('modal-url');
    const longUrl = `https://verify.spiceveg.in/?id=${id}`;
    if (item && item.shortUrl) {
        modalUrl.innerHTML = `
            <span style="display:inline-block;text-align:left;">
                <b style="color:var(--green-primary);">Short:</b> <a href="${item.shortUrl}" target="_blank" style="color:var(--green-primary);">${item.shortUrl}</a><br>
                <b>Long:</b> <span style="opacity:0.7;">${longUrl}</span>
            </span>`;
    } else {
        modalUrl.textContent = longUrl;
    }
}
function closeModal() { document.getElementById('modal-wrap').style.display = 'none'; }
function downloadModalQR() {
    const canvas = document.querySelector('#modal-qr canvas');
    if (!canvas) return;
    const urlText = document.getElementById('modal-url').textContent;
    const id = urlText.split('id=')[1];
    const link = document.createElement('a');
    link.download = `SpiceVeg_Label_${id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function openCultivation() {
    const crop = document.getElementById('c-crop').textContent.toLowerCase().replace(/\s+/g, '_');
    const img = document.getElementById('lb-img');
    img.src = `technique_${crop}.png`;
    img.onerror = () => { img.src = 'src/practices.jpg'; }; // fallback
    
    // Reset click handler if it was modified by lazy loader previously
    img.onclick = null; 
    img.style.filter = 'none';
    
    // Apply speed test logic to this image specifically
    if (IS_LOW_SPEED) {
        img.dataset.src = img.src;
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        img.style.cursor = 'pointer';
        img.style.filter = 'grayscale(100%) blur(2px)';
        img.onclick = function() {
            this.src = this.dataset.src;
            this.style.filter = 'none';
            this.onclick = null;
        };
        showToast('Low speed detected. Tap image to load.', 'success');
    }
    
    document.getElementById('lightbox').style.display = 'flex';
    history.pushState({lb:1}, '');
}
function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }

// --- CUSTOMER LOGIC ---
async function loadCustomerView(id) {
    showPage('customer-page');
    const data = await fsGet(COLLECTION, 'lot_' + id);
    hideSpinner();
    
    if (!data) {
        document.getElementById('customer-page').innerHTML = `
            <div style="text-align:center;padding:100px 20px;">
                <div style="font-size:40px;">⚠️</div>
                <h3>Information Not Found</h3>
                <p style="color:var(--text-muted);">The QR code you scanned is invalid or the record has been removed.</p>
            </div>
        `;
        return;
    }

    // All fields render with '—' fallback so missing data never shows as blank/undefined.
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
    setText('c-crop', data.crop);
    setText('c-variety', data.variety);
    setText('c-lotNo', data.lotNo);
    setText('c-dot', data.dot);
    setText('c-dop', data.dop);
    setText('c-validUpto', data.validUpto);
    setText('c-netWeight', data.netWeight);
    setText('c-mrp', data.mrp ? `₹${data.mrp}/-` : '—');

    // Quality block: visible only when the lot has at least one quality metric.
    const hasQuality = data.physicalPurity || data.geneticPurity || data.germination || data.moisture;
    if (hasQuality) {
        document.getElementById('c-quality-section').style.display = 'block';
        setText('c-physicalPurity', data.physicalPurity);
        setText('c-geneticPurity', data.geneticPurity);
        setText('c-germination', data.germination);
        setText('c-moisture', data.moisture);
    }

    // Producer block: always fall back to the canonical COMPANY values
    // so customers always see who produced/packed/marketed the seed.
    document.getElementById('c-producer-section').style.display = 'block';
    setText('c-producedBy', data.producedBy || COMPANY.producedBy);
    setText('c-packedBy',   data.packedBy   || COMPANY.packedBy);
    setText('c-marketedBy', data.marketedBy || COMPANY.marketedBy);

    // Back button protection
    history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
        if (document.getElementById('lightbox').style.display === 'flex') {
            closeLightbox();
        } else {
            history.pushState(null, '', window.location.href);
        }
    };
}

// --- UTILS ---
function hideSpinner() { document.getElementById('loading-screen').style.display = 'none'; }

function showToast(msg, type = 'success') {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${type==='success'?'var(--green-primary)':'var(--danger)'};color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = '0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

function printLabelUI() {
    const data = readLabelForm();
    const canvas = document.querySelector('#qr-box canvas');
    const qr = canvas ? canvas.toDataURL() : '';

    const qualityRow = (data.physicalPurity || data.geneticPurity || data.germination || data.moisture)
        ? `<div class="hr"></div>
           <center style="font-size:8px;letter-spacing:0.05em;">QUALITY PARAMETERS</center>
           ${data.physicalPurity ? `<div class="row"><span>Physical Purity:</span> <b>${data.physicalPurity}</b></div>` : ''}
           ${data.geneticPurity ? `<div class="row"><span>Genetic Purity:</span> <b>${data.geneticPurity}</b></div>` : ''}
           ${data.germination ? `<div class="row"><span>Germination:</span> <b>${data.germination}</b></div>` : ''}
           ${data.moisture ? `<div class="row"><span>Moisture:</span> <b>${data.moisture}</b></div>` : ''}`
        : '';

    const producerRow = (data.producedBy || data.packedBy || data.marketedBy)
        ? `<div class="hr"></div>
           ${data.producedBy ? `<div style="font-size:8px;"><b>Produced by:</b> ${data.producedBy}</div>` : ''}
           ${data.packedBy ? `<div style="font-size:8px;"><b>Packed by:</b> ${data.packedBy}</div>` : ''}
           ${data.marketedBy ? `<div style="font-size:8px;"><b>Marketed by:</b> ${data.marketedBy}</div>` : ''}`
        : '';

    const w = window.open('', '_blank');
    w.document.write(`
        <html><head><style>
            body { font-family: sans-serif; font-size: 10px; padding: 5mm; width: 60mm; border: 1px solid #eee; }
            .brand { font-size: 14px; font-weight: bold; color: #3B6D11; display: flex; align-items: center; gap: 5px; }
            .hr { height: 1px; background: #ddd; margin: 2mm 0; }
            .row { display: flex; justify-content: space-between; margin: 0.5mm 0; }
            .qr { width: 30mm; height: 30mm; display: block; margin: 2mm auto; }
        </style></head><body>
            <div class="brand">SpiceVeg™ <small style="color:#777;font-weight:normal;font-size:8px;">VEGETABLE SEEDS</small></div>
            <div class="hr"></div>
            <center><b>TRUTHFUL LABEL</b></center>
            <div class="row"><span>Crop:</span> <b>${data.crop}</b></div>
            <div class="row"><span>Variety:</span> <b>${data.variety}</b></div>
            <div class="row"><span>Lot No:</span> <b>${data.lotNo}</b></div>
            <div class="row"><span>Tested:</span> ${data.dot}</div>
            <div class="row"><span>Packed:</span> ${data.dop}</div>
            <div class="row"><span>Valid:</span> <b>${data.validUpto}</b></div>
            <div class="row"><span>Net Wt:</span> ${data.netWeight}</div>
            <div class="row"><span>MRP:</span> <b>₹${data.mrp}/-</b></div>
            ${qualityRow}
            <img src="${qr}" class="qr">
            ${producerRow}
            <center style="font-size:7px;color:#999;margin-top:1mm;">Scan to verify quality & cultivation techniques</center>
        </body></html>
    `);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
}

async function initStatus() {
    const elVer = document.getElementById('status-version');
    const elUpd = document.getElementById('status-updated');
    const elSym = document.getElementById('status-symbol');
    
    if (elVer) elVer.textContent = VERSION;
    if (elUpd) elUpd.textContent = LAST_UPDATED;
    
    // Simple check: Components (QRCode) + Firebase Ping
    try {
        const componentsOk = typeof QRCode !== 'undefined';
        const fbRes = await fetch(`${FS_BASE}?key=${FB.apiKey}&pageSize=1`);
        const fbOk = fbRes.ok;
        
        if (componentsOk && fbOk) {
            elSym.classList.add('ok');
            elSym.title = 'Systems Operational: Components Loaded & Firebase Live';
        } else {
            elSym.title = 'Systems Check Failed: ' + (!componentsOk ? 'Components Missing ' : '') + (!fbOk ? 'Firebase Offline' : '');
        }
    } catch (e) {
        elSym.title = 'Connection Error';
    }
}

// --- INIT ---
window.addEventListener('DOMContentLoaded', detectMode);
