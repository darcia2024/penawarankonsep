/* Demo Sistem PIP Machinery: satu aplikasi statis, data di data.js.
   Perubahan selama demo disimpan di browser (localStorage) dan bisa direset. */
(function () {
'use strict';

/* ================= Alat bantu ================= */
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const rpS = n => n >= 1e6 ? 'Rp ' + (n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt' : n >= 1000 ? 'Rp ' + (n / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' rb' : rp(n);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const toD = s => { const p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); };
const toS = d => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = toD(s); d.setUTCDate(d.getUTCDate() + n); return toS(d); };
const addMonths = (s, n) => { const d = toD(s); d.setUTCMonth(d.getUTCMonth() + n); return toS(d); };
const diff = (a, b) => Math.round((toD(b) - toD(a)) / 864e5); // b - a, dalam hari
const fd = s => { if (!s) return '—'; const d = toD(s); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
const fds = s => { if (!s) return '—'; const d = toD(s); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; };
const fdl = s => { const d = toD(s); return DAYS[d.getUTCDay()] + ', ' + d.getUTCDate() + ' ' + MONL[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
const monthYear = s => { const d = toD(s); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
const now = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0'); };
const clone = o => JSON.parse(JSON.stringify(o));
const sum = (a, f) => a.reduce((t, x) => t + f(x), 0);

/* ================= Data dan simpan ================= */
const KEY = 'pip-demo-sistem-v1';
const FLOW = {
  bahan: ['Menunggu bayar', 'Packing', 'Dikirim', 'Selesai'],
  mesin: ['Menunggu bayar', 'QC', 'Packing', 'Dikirim', 'Selesai'],
  custom: ['Menunggu bayar', 'Desain', 'Produksi', 'QC', 'Packing', 'Dikirim', 'Selesai']
};
const PREFIX = { 'soft-meja': 'SM', 'soft-berdiri': 'SB', 'hard-mixer': 'HM', 'wir-128y': 'WR', 'cup-sealer': 'CS', joelly: 'JY', puter: 'PT', bingsoo: 'BS', potong: 'PO' };

function seed() {
  const s = {
    products: clone(PRODUCTS), customers: clone(CUSTOMERS), units: clone(UNITS), tickets: clone(TICKETS),
    leads: clone(LEADS), chats: clone(CHATS), log: [], tour: { done: {}, hide: false }, pm: { step: 0, answers: {}, name: '', city: '' },
    user: 'Nisa', carts: {}, seq: { unit: 210 }
  };
  s.orders = clone(ORDERS).map(o => {
    const fl = FLOW[o.kind], i = fl.indexOf(o.status);
    o.pays = o.paid > 0 ? [{ amt: o.paid, date: o.date, note: o.paid >= orderTotal(o) ? 'Lunas' : 'DP' }] : [];
    delete o.paid;
    o.due = o.due || addDays(o.date, 3);
    if (!o.log) o.log = fl.slice(0, i + 1).map((s, k) => { const d = addDays(o.date, k); return [s, d > TODAY ? TODAY : d]; });
    return o;
  });
  s.log = [
    { t: '08.12', text: 'Prospek baru dari Pemilih Mesin: Rina, Surabaya' },
    { t: '07.55', text: 'PIP-2047 Bayu, Malang masuk tahap Packing' },
    { t: 'Kemarin', text: 'Order PIP-2055 dibuat untuk Kedai Dingin, Kediri' },
    { t: 'Kemarin', text: 'Tiket servis T-120 masuk lewat scan QR' }
  ];
  return s;
}
let S;
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { S = JSON.parse(raw); return; } } catch (e) { /* abaikan */ }
  S = seed();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* abaikan */ } }
function logIt(text) { S.log.unshift({ t: now(), text: text }); S.log = S.log.slice(0, 30); }

/* ================= Data turunan ================= */
const P = id => S.products.find(p => p.id === id) || PRODUCTS.find(p => p.id === id);
const C = id => S.customers.find(c => c.id === id);
const O = id => S.orders.find(o => o.id === id);
const U = s => S.units.find(u => u.serial === s);
const L = id => S.leads.find(l => l.id === id);
const CH = id => S.chats.find(c => c.id === id);
function orderTotal(o) { return sum(o.items, it => (PRODUCTS.find(p => p.id === it[0]) || {}).price * it[1]); }
const paidOf = o => sum(o.pays, p => p.amt);
const left = o => Math.max(0, orderTotal(o) - paidOf(o));
const isLunas = o => left(o) === 0;
const active = o => o.status !== 'Selesai';
const custName = id => { const c = C(id); return c ? c.name : '—'; };
const custLine = id => { const c = C(id); return c ? c.name + ', ' + c.city : '—'; };
const itemsText = o => o.items.map(it => P(it[0]).name + (P(it[0]).cat === 'bahan' || it[1] > 1 ? ' ' + it[1] + (P(it[0]).unit === 'kg' ? ' kg' : '×') : '')).join(', ');
const lineOf = p => ({ mesin: 'Mesin', paket: 'Paket usaha', gerobak: 'Gerobak' }[P(p).cat] || 'Bahan dan perlengkapan');
const lowItems = () => S.products.filter(p => p.min && p.stock < p.min);
const warrantyEnd = u => addMonths(u.sold, P(u.p).warranty || 12);
const warrantyOn = u => diff(TODAY, warrantyEnd(u)) >= 0;
const nextNum = (arr, pre) => pre + (Math.max.apply(null, arr.map(x => +String(x.id).replace(/\D/g, ''))) + 1);
const invOf = o => 'INV-' + (+o.id.slice(4) - 957);
function st(text, cls) { return '<span class="st ' + (cls || '') + '">' + esc(text) + '</span>'; }
function statusPill(s) { return st(s, s === 'Menunggu bayar' ? 'warn' : s === 'Selesai' ? 'mute' : s === 'Dikirim' ? 'ok' : ''); }
function payPill(o) {
  if (isLunas(o)) return st('Lunas', 'ok');
  if (paidOf(o) > 0) return st('DP masuk', '');
  return st(diff(TODAY, o.due) <= 0 ? 'Jatuh tempo' : 'Belum bayar', 'warn');
}
function lastBahan(cid) {
  return S.orders.filter(o => o.cust === cid && o.kind === 'bahan').sort((a, b) => b.date < a.date ? -1 : 1)[0];
}
function refill(c) { // perkiraan bahan habis
  const o = lastBahan(c.id); if (!o) return null;
  const end = addDays(o.date, c.cycle || 30), daysLeft = diff(TODAY, end);
  const fresh = S.orders.some(x => x.cust === c.id && x.kind === 'bahan' && active(x));
  return { order: o, end: end, daysLeft: daysLeft, fresh: fresh, state: fresh ? 'Sudah pesan lagi' : daysLeft < -7 ? 'Jarang pesan' : daysLeft <= 5 ? 'Segera habis' : 'Aman' };
}
function badges() {
  return {
    chat: sum(S.chats, c => c.unread || 0),
    prospek: S.leads.filter(l => l.stage !== 'Jadi order' && l.follow <= TODAY).length,
    penjualan: S.orders.filter(o => o.status === 'Menunggu bayar').length,
    stok: lowItems().length,
    servis: S.tickets.filter(t => t.status === 'Menunggu teknisi' || t.status === 'Baru').length,
    keuangan: S.orders.filter(o => left(o) > 0 && diff(TODAY, o.due) <= 0).length,
    pelanggan: S.customers.filter(c => c.mitra && c.consent && (r => r && !r.fresh && r.state !== 'Aman' && !c.reminded)(refill(c))).length
  };
}

/* ================= Gambar produk (digambar dengan kode) ================= */
function pic(p) {
  const cat = typeof p === 'string' ? p : p.cat, s = 'fill="none" stroke="#072d59" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  const o = 'fill="#ea580c"';
  const g = {
    mesin: '<rect x="30" y="20" width="60" height="70" rx="6" ' + s + '/><rect x="40" y="30" width="40" height="14" rx="3" ' + s + '/><path d="M60 56v14M52 70h16" ' + s + '/><path d="M54 76h12l-6 14z" ' + o + '/><path d="M36 90h48v8H36z" ' + s + '/>',
    paket: '<rect x="18" y="40" width="84" height="54" rx="5" ' + s + '/><path d="M18 56h84M60 40v54" ' + s + '/><path d="M44 40c-10-14 6-22 16 0 10-22 26-14 16 0" ' + s + '/><circle cx="88" cy="28" r="9" ' + o + '/>',
    gerobak: '<path d="M14 40h80v36H14z" ' + s + '/><path d="M20 40l6-18h56l6 18" ' + s + '/><path d="M94 52h14" ' + s + '/><circle cx="32" cy="86" r="9" ' + s + '/><circle cx="76" cy="86" r="9" ' + s + '/><rect x="26" y="50" width="40" height="14" rx="2" ' + o + '/>',
    bahan: '<path d="M34 26h52l6 70H28z" ' + s + '/><path d="M34 26l6-10h40l6 10" ' + s + '/><circle cx="60" cy="58" r="13" ' + o + '/><path d="M40 82h40" ' + s + '/>',
    cone: '<path d="M38 46h44L60 100z" ' + s + '/><path d="M44 58l26 20M52 46l22 18M76 58L56 76" ' + s + '/><circle cx="50" cy="38" r="12" ' + o + '/><circle cx="70" cy="38" r="12" fill="#f6b48b"/>',
    topping: '<path d="M38 36h44v56a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6z" ' + s + '/><path d="M44 22h32v14H44z" ' + s + '/><path d="M38 62c10 6 34 6 44 0v24H38z" ' + o + '/>',
    alat: '<rect x="28" y="24" width="64" height="72" rx="4" ' + s + '/><path d="M40 44h40M40 58h40M40 72h24" ' + s + '/><circle cx="80" cy="80" r="8" ' + o + '/>'
  };
  return '<div class="pic" aria-hidden="true"><svg viewBox="0 0 120 110">' + (g[cat] || g.alat) + '</svg></div>';
}
const ICON = {
  dasbor: '<path d="M3 3h6v8H3zM11 3h6v5h-6zM11 10h6v7h-6zM3 13h6v4H3z"/>',
  chat: '<path d="M3 4h14v9H8l-4 3v-3H3z"/>',
  prospek: '<circle cx="7" cy="7" r="3"/><path d="M2 17c0-3 2.5-5 5-5s5 2 5 5M13 6.5a2.6 2.6 0 1 1 0 5M14.5 12.5c2 .5 3.5 2.3 3.5 4.5"/>',
  penjualan: '<path d="M3 4h2l2 9h9l2-6H6"/><circle cx="8" cy="16.5" r="1.3"/><circle cx="15" cy="16.5" r="1.3"/>',
  stok: '<path d="M10 2 3 6v8l7 4 7-4V6zM3 6l7 4 7-4M10 10v8"/>',
  produksi: '<path d="M3 17h14M5 17V9l4 3V9l4 3V5h3v12"/>',
  servis: '<path d="M14 3a4 4 0 0 0-5 5L3 14l3 3 6-6a4 4 0 0 0 5-5l-2.5 2.5-2-.5-.5-2z"/>',
  keuangan: '<rect x="2.5" y="5" width="15" height="11" rx="2"/><path d="M13 10.5h4.5M2.5 8h15"/>',
  pelanggan: '<circle cx="10" cy="7" r="3.2"/><path d="M3.5 17c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/>',
  laporan: '<path d="M5 2.5h7l3.5 3.5v11.5H5zM12 2.5V6h3.5M8 10h5M8 13h5"/>'
};
const ic = n => '<svg viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICON[n] + '</g></svg>';

/* ================= Alur demo (tur) ================= */
const TOUR = [
  { k: 'lead', who: 'Pembeli', t: 'Isi Pemilih Mesin, lalu kirim ke admin', go: () => '#/web/pemilih' },
  { k: 'reply', who: 'Admin', t: 'Balas chat prospek di Pusat Chat', go: () => '#/tim/chat' + (S.tour.lead && L(S.tour.lead) ? '/' + L(S.tour.lead).chat : '') },
  { k: 'order', who: 'Admin', t: 'Jadikan prospek itu sebuah order', go: () => '#/tim/prospek' },
  { k: 'pay', who: 'Keuangan', t: 'Catat DP dan pelunasan', go: () => S.tour.order ? '#/tim/order/' + S.tour.order : '#/tim/keuangan' },
  { k: 'ship', who: 'Gudang', t: 'Majukan status sampai dikirim, isi resi', go: () => S.tour.order ? '#/tim/order/' + S.tour.order : '#/tim/produksi' },
  { k: 'track', who: 'Pelanggan', t: 'Lacak pesanan dari HP', go: () => '#/lacak/' + (S.tour.order || 'PIP-2047') },
  { k: 'ticket', who: 'Pelanggan', t: 'Scan QR di mesin, lalu lapor kendala', go: () => '#/qr/' + (S.tour.serial || 'SM-0187') },
  { k: 'fix', who: 'Teknisi', t: 'Jadwalkan teknisi dan tutup tiket servis', go: () => '#/tim/servis' },
  { k: 'reorder', who: 'Mitra', t: 'Pesan ulang bahan dari halaman mitra', go: () => '#/mitra/c-lina' },
  { k: 'report', who: 'Pemilik', t: 'Buka laporan bulanan', go: () => '#/tim/laporan' }
];
function done(k) { if (!S.tour.done[k]) { S.tour.done[k] = true; save(); renderTour(); } }
function tourNext() { return TOUR.findIndex(s => !S.tour.done[s.k]); }
function renderTour() {
  const el = $('#tour');
  if (S.tour.hide || route()[0] === '') { el.innerHTML = ''; return; }
  const i = tourNext(), n = Object.keys(S.tour.done).length;
  el.innerHTML = '<div class="tour"><div class="tour-in">' +
    (i < 0 ? '<span class="tour-step">Alur demo selesai</span><span class="tour-text">Semua 10 langkah sudah dicoba. Data bisa direset dari halaman awal.</span>' :
      '<span class="tour-step">Alur demo ' + (i + 1) + '/10</span><span class="tour-text"><b>' + TOUR[i].who + ':</b> ' + TOUR[i].t + '</span>' +
      '<span class="tour-bar" aria-hidden="true"><i style="width:' + n * 10 + '%"></i></span><a class="btn sm dark" href="' + TOUR[i].go() + '">Buka</a>') +
    '<button class="link small" type="button" data-act="tour-hide">Sembunyikan</button></div></div>';
}

/* ================= Modal dan toast ================= */
function modal(title, body, wide) {
  const m = $('#modal');
  m.innerHTML = '<div class="modal-box' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="m-title"><div class="modal-head"><h2 id="m-title">' + title + '</h2><button class="x" type="button" data-act="close" aria-label="Tutup">×</button></div>' + body + '</div>';
  m.hidden = false;
  const f = m.querySelector('input:not([type=hidden]), select, textarea, button.btn');
  if (f) f.focus();
}
function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
let toastTimer;
function toast(text, href, linkText) {
  const t = $('#toast');
  t.innerHTML = '<span>' + text + '</span>' + (href ? '<a href="' + href + '">' + (linkText || 'Lihat') + '</a>' : '');
  t.classList.add('on'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 5200);
}

/* ================= Aksi bisnis ================= */
function newChat(name, city, label, lead, cust) {
  const ch = { id: 'ch-' + Date.now().toString(36) + Math.floor(Math.random() * 99), name: name, city: city, channel: 'WhatsApp', label: label, admin: S.user, unread: 1, lead: lead, cust: cust, msgs: [] };
  S.chats.unshift(ch); return ch;
}
function chatFor(cid) {
  let ch = S.chats.find(c => c.cust === cid);
  if (!ch) { const c = C(cid); ch = newChat(c.name, c.city, c.mitra ? 'Mitra' : 'Pelanggan', null, cid); ch.unread = 0; }
  return ch;
}
function pushMsg(ch, who, text, unread) {
  ch.msgs.push([who, text, now()]);
  if (unread) ch.unread = (ch.unread || 0) + 1;
  S.chats = [ch].concat(S.chats.filter(c => c !== ch));
}
function createInquiry(d) { // dari website pembeli
  const id = nextNum(S.leads, 'L-');
  const name = d.name || 'Pengunjung website', city = d.city || 'kota belum diisi';
  const lead = { id: id, name: name, city: city, p: d.p, src: d.src, stage: d.stage || 'Baru', follow: TODAY, created: TODAY, note: d.note || '', answers: d.answers };
  const ch = newChat(name, city, 'Prospek', id);
  lead.chat = ch.id;
  ch.msgs.push(['in', d.text, now()]);
  S.leads.unshift(lead);
  logIt('Prospek baru dari ' + d.src + ': ' + name + ', ' + city);
  return lead;
}
function findOrMakeCustomer(name, city) {
  let c = S.customers.find(x => x.name.toLowerCase() === name.toLowerCase() && x.city.toLowerCase() === city.toLowerCase());
  if (!c) { c = { id: 'c-' + Date.now().toString(36), name: name, city: city, phone: '08xx (dari chat)' }; S.customers.push(c); }
  return c;
}
function createOrder(cust, items, src) {
  const kind = items.some(it => P(it[0]).custom) ? 'custom'
    : items.some(it => ['mesin', 'paket'].indexOf(P(it[0]).cat) >= 0) ? 'mesin' : 'bahan';
  const o = { id: nextNum(S.orders, 'PIP-'), cust: cust.id, date: TODAY, kind: kind, items: items, pays: [], status: 'Menunggu bayar', due: addDays(TODAY, kind === 'bahan' ? 1 : 3), log: [['Menunggu bayar', TODAY]], src: src };
  S.orders.unshift(o);
  logIt('Order ' + o.id + ' dibuat untuk ' + cust.name + ', ' + cust.city + ' (' + rpS(orderTotal(o)) + ')');
  return o;
}
function addPayment(o, amt, note) {
  amt = Math.min(Math.round(amt), left(o)); if (amt <= 0) return;
  o.pays.push({ amt: amt, date: TODAY, note: note });
  logIt('Pembayaran ' + rp(amt) + ' masuk untuk ' + o.id + ' (' + note + ')');
  if (o.id === S.tour.order || !S.tour.order) done('pay');
}
function canAdvance(o) {
  const fl = FLOW[o.kind], i = fl.indexOf(o.status), next = fl[i + 1];
  if (!next) return { ok: false, why: 'Order sudah selesai.' };
  if (o.status === 'Menunggu bayar' && o.kind !== 'bahan' && paidOf(o) === 0) return { ok: false, why: 'Belum ada DP. Catat pembayaran dulu.', next: next };
  if (o.status === 'Menunggu bayar' && o.kind === 'bahan' && !isLunas(o)) return { ok: false, why: 'Pesanan bahan dikemas setelah lunas.', next: next };
  if (next === 'Dikirim' && !isLunas(o)) return { ok: false, why: 'Pelunasan wajib sebelum barang dikirim. Sisa ' + rp(left(o)) + '.', next: next };
  return { ok: true, next: next };
}
function advance(o, resi) {
  const c = canAdvance(o); if (!c.ok) return;
  o.status = c.next; o.log.push([c.next, TODAY]);
  if (c.next === 'Dikirim') {
    o.resi = resi;
    o.items.forEach(it => { const p = S.products.find(x => x.id === it[0]); if (p && p.stock != null) p.stock = Math.max(0, p.stock - it[1]); });
    o.items.forEach(it => {
      if (['mesin', 'paket'].indexOf(P(it[0]).cat) < 0) return;
      for (let k = 0; k < it[1]; k++) {
        const serial = (PREFIX[it[0]] || 'PM') + '-0' + (S.seq.unit++);
        S.units.push({ serial: serial, p: it[0], cust: o.cust, sold: TODAY, order: o.id });
        if (o.id === S.tour.order) S.tour.serial = serial;
      }
    });
    const ch = chatFor(o.cust);
    pushMsg(ch, 'out', 'Pesanan ' + o.id + ' sudah dikirim. Resi: ' + resi + '\nLacak di: pipmachinery.id/lacak/' + o.id);
    if (o.id === S.tour.order || !S.tour.order) done('ship');
  }
  logIt(o.id + ' masuk tahap ' + c.next);
}

/* ================= Router ================= */
function route() { return (location.hash.replace(/^#\/?/, '') || '').split('/'); }
let lastPath = null;
function render() {
  const r = route(), path = r.join('/');
  const side = r[0] === 'web' ? 'web' : r[0] === 'tim' ? 'tim' : ['pelanggan', 'lacak', 'mitra', 'qr'].indexOf(r[0]) >= 0 ? 'pelanggan' : '';
  document.querySelectorAll('.sides a').forEach(a => a.setAttribute('aria-current', String(a.dataset.side === side)));
  let html;
  try {
    if (r[0] === 'web') html = viewWeb(r);
    else if (r[0] === 'tim') html = viewTim(r);
    else if (r[0] === 'pelanggan') html = viewPelanggan();
    else if (r[0] === 'lacak') html = viewLacak(r[1]);
    else if (r[0] === 'mitra') html = viewMitra(r[1]);
    else if (r[0] === 'qr') html = viewQR(r[1]);
    else html = viewHub();
  } catch (e) { console.warn(e); html = '<p class="empty">Halaman tidak ditemukan. <a href="#/">Kembali ke awal</a></p>'; }
  $('#app').innerHTML = html;
  renderTour();
  afterRender(r);
  if (path !== lastPath) {
    window.scrollTo(0, 0);
    if (lastPath !== null) $('#app').focus({ preventScroll: true });
    lastPath = path;
  }
  const t = { web: 'Website pembeli', tim: 'Sistem tim', pelanggan: 'Layar pelanggan' }[side];
  document.title = (t ? t + ' · ' : '') + 'Demo Sistem PIP Machinery';
}
function afterRender(r) {
  const msgs = $('.msgs'); if (msgs) msgs.scrollTop = msgs.scrollHeight;
  if (r[0] === 'web' && r[1] === 'modal' || r[0] === 'web' && r[1] === 'paket') updCalc();
  if (r[0] === 'web' && r[1] === 'pemilih') updBubble();
}

/* ================= Beranda demo ================= */
const MODULES = [
  ['Website pembeli', 'Beranda dan katalog mesin, bahan, gerobak, paket', '#/web', 'Website'],
  ['Website pembeli', 'Halaman produk dengan video QC', '#/web/produk/soft-meja', 'Website'],
  ['Website pembeli', 'Pemilih Mesin', '#/web/pemilih', 'Website'],
  ['Website pembeli', 'Hitung modal dan balik modal', '#/web/modal', 'Website'],
  ['Website pembeli', 'Halaman Paket Usaha', '#/web/paket', 'Website'],
  ['Website pembeli', 'Jadwal coba mesin', '#/web/produk/soft-berdiri', 'Website'],
  ['Website pembeli', 'Form gerobak custom', '#/web/gerobak', 'Website'],
  ['Sistem tim', 'Pusat chat: satu nomor, banyak admin', '#/tim/chat', 'Bisnis'],
  ['Sistem tim', 'Prospek dan pengingat follow up', '#/tim/prospek', 'Bisnis'],
  ['Sistem tim', 'Dasbor', '#/tim/dasbor', 'Bisnis'],
  ['Sistem tim', 'Penjualan (order)', '#/tim/penjualan', 'Bisnis'],
  ['Sistem tim', 'Stok', '#/tim/stok', 'Bisnis'],
  ['Layar pelanggan', 'Lacak pesanan', '#/lacak/PIP-2047', 'Bisnis'],
  ['Sistem tim', 'Produksi gerobak', '#/tim/produksi', 'Lengkap'],
  ['Sistem tim', 'Servis dan garansi', '#/tim/servis', 'Lengkap'],
  ['Sistem tim', 'Keuangan', '#/tim/keuangan', 'Lengkap'],
  ['Sistem tim', 'Pengingat pesan ulang bahan', '#/tim/pelanggan/pengingat', 'Lengkap'],
  ['Sistem tim', 'Laporan bulanan pemilik', '#/tim/laporan', 'Lengkap'],
  ['Layar pelanggan', 'Halaman mitra dan pesan ulang', '#/mitra/c-lina', 'Lengkap'],
  ['Layar pelanggan', 'QR di setiap mesin', '#/qr/SM-0187', 'Lengkap']
];
function viewHub() {
  const i = tourNext(), n = Object.keys(S.tour.done).length;
  const sides = [
    ['Website pembeli', 'Yang dilihat calon pembeli dari Google atau Instagram.', '#/web', 'Website'],
    ['Layar pelanggan', 'Dibuka pelanggan lewat tautan WhatsApp atau QR di mesin. Tanpa aplikasi.', '#/pelanggan', 'Layar pelanggan'],
    ['Sistem tim', 'Dipakai admin, gudang, teknisi, dan pemilik setiap hari.', '#/tim/dasbor', 'Sistem tim']
  ];
  return '<div class="hub-head"><div><p class="kicker">PIP Machinery · demo sistem lengkap</p><h1 class="h1">Satu sistem, dari pembeli pertama sampai pesan ulang</h1>' +
    '<p class="lead" style="margin-top:12px">Semua modul di penawaran bisa dicoba di sini. Data saling tersambung: prospek dari website masuk ke chat admin, jadi order, dikirim, lalu dilacak pelanggan.</p></div>' +
    '<div class="card"><h3>Alur demo, ' + n + ' dari 10 langkah</h3><div class="tour-bar" style="flex:none;width:100%;margin-bottom:12px"><i style="width:' + n * 10 + '%"></i></div>' +
    '<div class="btn-row">' + (i < 0 ? '<span class="st ok">Selesai semua</span>' : '<a class="btn pri" href="' + TOUR[i].go() + '">' + (n ? 'Lanjut langkah ' + (i + 1) : 'Mulai dari langkah 1') + '</a>') +
    '<button class="btn" type="button" data-act="reset">Reset data demo</button></div><p class="small muted" style="margin-top:10px">Perubahan tersimpan di browser ini saja.</p></div></div>' +
    '<div class="grid g3" style="margin-bottom:28px">' + sides.map(s => '<a class="card side-card" href="' + s[2] + '"><h2>' + s[0] + '</h2><p class="muted">' + s[1] + '</p><ul>' +
      MODULES.filter(m => m[0] === s[0]).map(m => '<li>' + m[1] + '</li>').join('') + '</ul><span class="go">Buka ' + s[3].toLowerCase() + ' →</span></a>').join('') + '</div>' +
    '<div class="grid g2"><section class="card"><h3>Alur dari awal sampai akhir</h3><ol class="flow">' + TOUR.map((s, k) =>
      '<li class="' + (S.tour.done[s.k] ? 'done' : k === i ? 'now' : '') + '"><span><b>' + s.t + '</b><span class="who">' + s.who + '</span></span><a class="btn sm" href="' + s.go() + '">Buka</a></li>').join('') + '</ol></section>' +
    '<section class="card"><h3>Semua modul di penawaran</h3><p class="small muted" style="margin-bottom:8px">Label kanan menunjukkan paket yang memuat modul itu.</p><ul class="mod-list" style="grid-template-columns:minmax(0,1fr)">' +
      MODULES.map(m => '<li><a href="' + m[2] + '">' + m[1] + '</a>' + st(m[3], m[3] === 'Website' ? 'mute' : m[3] === 'Bisnis' ? '' : 'warn') + '</li>').join('') + '</ul>' +
      '<p class="small" style="margin-top:12px"><a href="../pitch-deck/">Kembali ke penawaran</a> · <a href="' + PEMILIH_LAMA + '">Demo Pemilih Mesin versi tunggal</a></p></section></div>';
}

/* ================= Website pembeli ================= */
function siteFrame(cur, body) {
  const links = [['mesin', 'Mesin', '#/web/katalog/mesin'], ['bahan', 'Bahan', '#/web/katalog/bahan'], ['gerobak', 'Gerobak', '#/web/gerobak'], ['paket', 'Paket Usaha', '#/web/paket'], ['pemilih', 'Pemilih Mesin', '#/web/pemilih'], ['lacak', 'Lacak pesanan', '#/web/lacak']];
  return '<div class="site"><div class="w-nav"><a href="#/web" aria-label="Beranda PIP Machinery"><img src="' + LOGO + '" alt="PIP Machinery"></a><nav class="w-links" aria-label="Menu website">' +
    links.map(l => '<a href="' + l[2] + '" aria-current="' + (cur === l[0]) + '">' + l[1] + '</a>').join('') +
    '<a class="chat" href="#" data-act="ask" data-p="">Chat admin</a></nav></div><div class="w-body">' + body + '</div></div>';
}
function viewWeb(r) {
  const pg = r[1] || '';
  if (pg === 'katalog') return siteFrame(r[2] === 'bahan' ? 'bahan' : 'mesin', webKatalog(r[2] || 'mesin'));
  if (pg === 'produk') return siteFrame(['bahan', 'cone', 'topping', 'alat'].indexOf(P(r[2]).cat) >= 0 ? 'bahan' : 'mesin', webProduk(P(r[2])));
  if (pg === 'pemilih') return siteFrame('pemilih', webPemilih());
  if (pg === 'paket') return siteFrame('paket', webPaket());
  if (pg === 'modal') return siteFrame('pemilih', webModal(r[2]));
  if (pg === 'gerobak') return siteFrame('gerobak', webGerobak());
  if (pg === 'lacak') return siteFrame('lacak', webLacakForm());
  return siteFrame('', webHome());
}
function prodCard(p) {
  return '<a class="prod" href="#/web/produk/' + p.id + '">' + pic(p) + '<b>' + esc(p.name) + '</b><span class="price">' + (p.custom ? 'Mulai ' : '') + rp(p.price) + (['mesin', 'paket', 'gerobak'].indexOf(p.cat) < 0 ? ' / ' + p.unit : '') + '</span>' +
    (p.capLabel ? '<small>' + p.capLabel + ' · ± ' + p.watt.toLocaleString('id-ID') + ' W</small>' : '<small>' + esc(CAT_LABEL[p.cat]) + '</small>') + '</a>';
}
function webHome() {
  const cats = [['mesin', 'Mesin es krim', 'Soft, hard, dan cup sealer', '#/web/katalog/mesin'], ['bahan', 'Bahan Joelly', 'Lebih dari 15 rasa', '#/web/katalog/bahan'], ['gerobak', 'Gerobak custom', 'Dengan merek usaha Anda', '#/web/gerobak'], ['paket', 'Paket usaha', 'Mulai Rp 8 juta', '#/web/paket']];
  return '<div class="w-hero"><div><p class="kicker">Melayani seluruh Indonesia sejak 2013</p><h1 class="h1">Mesin dan bahan es krim dalam satu tempat</h1>' +
    '<p class="lead">Dari memilih mesin sampai pesan bahan rutin. Mesin bisa dicoba dulu di toko Bantul atau lewat video call.</p>' +
    '<div class="btn-row" style="margin-top:18px"><a class="btn pri" href="#/web/pemilih">Cari mesin yang cocok</a><a class="btn" href="#/web/modal">Hitung modal usaha</a></div></div>' +
    '<div>' + pic('mesin') + '</div></div>' +
    '<div class="w-cats">' + cats.map(c => '<a class="w-cat" href="' + c[3] + '">' + pic(c[0]) + '<b>' + c[1] + '</b><small>' + c[2] + '</small></a>').join('') + '</div>' +
    '<h2 class="h2" style="margin:32px 0 14px">Mesin paling dicari</h2><div class="prod-grid">' + ['soft-meja', 'wir-128y', 'joelly', 'soft-berdiri'].map(id => prodCard(P(id))).join('') + '</div>';
}
function webKatalog(cat) {
  const groups = { mesin: ['mesin', 'paket', 'gerobak'], bahan: ['bahan', 'cone', 'topping', 'alat'] }[cat] || ['mesin'];
  return '<p class="kicker">Katalog</p><h1 class="h2" style="margin-bottom:6px">' + (cat === 'bahan' ? 'Bahan, cone, dan perlengkapan' : 'Mesin, paket usaha, dan gerobak') + '</h1>' +
    '<p class="muted" style="margin-bottom:18px">Harga tersimpan di satu tempat. Admin mengubahnya dari menu Stok, website ikut berubah.</p>' +
    groups.map(g => '<h2 style="font-size:18px;margin:18px 0 10px">' + CAT_LABEL[g] + '</h2><div class="prod-grid">' + S.products.filter(p => p.cat === g).map(prodCard).join('') + '</div>').join('');
}
function webProduk(p) {
  const machine = ['mesin', 'paket'].indexOf(p.cat) >= 0;
  return '<p class="small" style="margin-bottom:12px"><a href="#/web/katalog/' + (machine || p.cat === 'gerobak' ? 'mesin' : 'bahan') + '">Katalog</a> / ' + esc(p.name) + '</p>' +
    '<div class="pd"><div>' + pic(p) + (machine ? '<div class="video" style="margin-top:12px" role="button" tabindex="0" data-act="video" data-title="Video QC ' + esc(p.name) + '"><span class="play"></span><span class="cap">Video QC sebelum dikirim · 1:24</span></div>' : '') + '</div>' +
    '<div><p class="kicker">' + CAT_LABEL[p.cat] + (p.publik ? ' · harga dari website sekarang' : '') + '</p><h1 class="h2">' + esc(p.name) + '</h1>' +
    '<p style="font-size:24px;font-weight:700;color:var(--orange-deep);margin:8px 0">' + (p.custom ? 'Mulai ' : '') + rp(p.price) + (machine || p.custom ? '' : ' / ' + p.unit) + '</p><p class="muted">' + esc(p.desc) + '</p>' +
    '<dl class="spec">' + (p.capLabel ? '<dt>Kapasitas</dt><dd>' + p.capLabel + '</dd><dt>Listrik</dt><dd>± ' + p.watt.toLocaleString('id-ID') + ' W</dd>' : '') +
      (machine ? '<dt>Garansi</dt><dd>' + (p.warranty || 12) + ' bulan, teknisi dan video call</dd><dt>Setelah beli</dt><dd>QR di mesin: tutorial, garansi, lapor kendala</dd>' : '') +
      '<dt>Stok</dt><dd>' + (p.custom ? 'Dibuat sesuai pesanan' : p.stock > 0 ? 'Tersedia di Bantul' : 'Inden, tanya admin') + '</dd></dl>' +
    '<div class="btn-row">' + (p.custom ? '<a class="btn pri" href="#/web/gerobak">Isi form gerobak custom</a>' : '<button class="btn pri" type="button" data-act="ask" data-p="' + p.id + '">Tanya lewat WhatsApp</button>') +
      (machine ? '<button class="btn" type="button" data-act="try" data-p="' + p.id + '">Jadwalkan coba mesin</button><a class="btn" href="#/web/modal/' + p.id + '">Hitung modal</a>' : '') + '</div></div></div>';
}
function webGerobak() {
  return '<div class="pd"><div><p class="kicker">Gerobak custom</p><h1 class="h2">Gerobak dengan merek usaha Anda</h1><p class="muted" style="margin:8px 0 14px">Isi kebutuhannya, admin kirim desain awal dan harga. Rata-rata selesai 9 hari kerja, lengkap dengan video QC sebelum dikirim.</p>' + pic('gerobak') +
    '<p class="small muted" style="margin-top:10px">Mulai ' + rp(P('gerobak').price) + ' untuk ukuran 1,5 m (contoh).</p></div>' +
    '<form class="card" data-form="gerobak"><h3>Form gerobak custom</h3>' +
    '<div class="grid g2" style="gap:0 12px"><label class="field">Nama<input name="name" required autocomplete="name"></label><label class="field">Kota<input name="city" required></label></div>' +
    '<label class="field">Ukuran<select name="size"><option>1,2 m</option><option selected>1,5 m</option><option>2 m</option></select></label>' +
    '<label class="field">Mau jual apa<select name="jual"><option>Soft ice cream</option><option>Hard es krim</option><option>Es bingsoo</option><option>Kopi dan es</option><option>Lainnya</option></select></label>' +
    '<label class="field">Warna utama<input name="color" placeholder="contoh: oranye dan putih"></label>' +
    '<label class="field">Tulisan merek di gerobak<input name="brand" placeholder="contoh: Es Krim Mbak Rina"></label>' +
    '<label class="field"><span>Perlu mesin sekalian?</span><select name="mesin"><option value="">Tidak, gerobak saja</option>' + S.products.filter(p => p.cat === 'mesin').map(p => '<option value="' + p.id + '">' + esc(p.name) + '</option>').join('') + '</select></label>' +
    '<button class="btn pri block" type="submit">Kirim ke admin</button><p class="small muted" style="margin-top:8px">Di demo ini pesan masuk ke Pusat Chat tim, bukan ke WhatsApp.</p></form></div>';
}
function webLacakForm() {
  const act = S.orders.filter(active).slice(0, 4);
  return '<div style="max-width:520px"><p class="kicker">Lacak pesanan</p><h1 class="h2">Pesanan Anda sampai mana?</h1><p class="muted" style="margin:8px 0 16px">Masukkan nomor order dari chat admin, contoh PIP-2047.</p>' +
    '<form class="btn-row" data-form="lacak"><label class="sr" for="f-order">Nomor order</label><input id="f-order" name="id" style="flex:1;min-width:0;padding:10px;border:1.5px solid var(--line);border-radius:4px;font-size:16px" placeholder="PIP-2047" required><button class="btn pri" type="submit">Lacak</button></form>' +
    '<p class="small muted" style="margin-top:14px">Contoh untuk demo: ' + act.map(o => '<a href="#/lacak/' + o.id + '">' + o.id + '</a>').join(', ') + '</p></div>';
}

/* --- Hitung modal --- */
function calcHTML(pid) {
  const opts = S.products.filter(p => p.cost);
  const p = P(pid && P(pid) && P(pid).cost ? pid : 'joelly');
  return '<form class="card" data-form="none" id="calc"><h3>Hitung modal dan balik modal</h3>' +
    '<label class="field">Mesin atau paket<select name="p" data-calc>' + opts.map(o => '<option value="' + o.id + '"' + (o.id === p.id ? ' selected' : '') + '>' + esc(o.name) + ' · ' + rpS(o.price) + '</option>').join('') + '</select></label>' +
    '<div class="grid g2" style="gap:0 12px"><label class="field">Porsi terjual per hari<input name="porsi" type="number" min="0" value="70" data-calc></label>' +
    '<label class="field">Harga jual per porsi (Rp)<input name="harga" type="number" min="0" step="500" value="5000" data-calc></label>' +
    '<label class="field">Biaya bahan per porsi (Rp)<input name="biaya" type="number" min="0" step="100" value="' + p.cost + '" data-calc><small>Bahan, cone, topping</small></label>' +
    '<label class="field">Hari buka per bulan<input name="hari" type="number" min="1" max="31" value="30" data-calc></label></div>' +
    '<label class="field">Biaya lain per bulan (Rp)<input name="lain" type="number" min="0" step="50000" value="0" data-calc><small>Sewa tempat, listrik, gaji. Isi 0 bila belum tahu.</small></label>' +
    '<div class="calc-out" aria-live="polite"><div><small>Modal awal</small><b id="c-modal"></b></div><div><small>Laba bersih per bulan</small><b id="c-laba"></b></div><div><small>Balik modal</small><b id="c-bep"></b></div></div>' +
    '<p class="small muted" style="margin-top:10px">Hitungan perkiraan, bukan janji hasil. Contoh paket Joelly: 70 porsi per hari, laba sekitar Rp 4,8 juta per bulan.</p></form>';
}
function updCalc() {
  const f = $('#calc'); if (!f) return;
  const v = n => Math.max(0, +f.elements[n].value || 0), p = P(f.elements.p.value);
  const laba = v('porsi') * v('hari') * (v('harga') - v('biaya')) - v('lain');
  $('#c-modal').textContent = rpS(p.price);
  $('#c-laba').textContent = laba > 0 ? rpS(laba) : 'Belum untung';
  $('#c-bep').textContent = laba > 0 ? '± ' + (Math.ceil(p.price / laba * 2) / 2).toLocaleString('id-ID') + ' bulan' : '—';
}
function webModal(pid) {
  return '<div class="pd"><div><p class="kicker">Hitung modal</p><h1 class="h2">Berapa lama modal usaha kembali?</h1><p class="muted" style="margin:8px 0 16px">Geser angkanya sesuai rencana Anda. Hasilnya bisa langsung dikirim ke admin untuk dicek bersama.</p>' +
    '<div class="notice info">Belum tahu mesin yang cocok? <a href="#/web/pemilih">Jawab empat pertanyaan di Pemilih Mesin</a>.</div></div>' + calcHTML(pid) + '</div>';
}
function webPaket() {
  const j = P('joelly');
  return '<div class="pd"><div>' + pic('paket') + '<p class="kicker" style="margin-top:16px">Paket Usaha / Joelly Es Krim</p><h1 class="h2">Paket Usaha Joelly Es Krim</h1>' +
    '<p style="font-size:26px;font-weight:700;color:var(--orange-deep);margin:6px 0">' + rp(j.price) + '</p><p class="muted">Mitra tinggal menyediakan lokasi. Merek boleh memakai nama usaha sendiri.</p>' +
    '<ul class="paket-list"><li>Freezer 300 liter</li><li>Mixer dan baskom</li><li>Scoop dan timbangan digital</li><li>Bahan baku dan resep</li><li>Waffle dan cone, 500 pcs per jenis</li><li>Kaos seragam dan video tutorial</li></ul>' +
    '<div class="btn-row"><button class="btn pri" type="button" data-act="ask" data-p="joelly" data-src="Halaman Paket Usaha">Daftar jadi mitra</button><button class="btn" type="button" data-act="try" data-p="joelly">Lihat langsung di toko</button></div>' +
    '<h2 style="font-size:18px;margin:24px 0 10px">Paket usaha lainnya</h2><div class="prod-grid">' + S.products.filter(p => p.cat === 'paket' && p.id !== 'joelly').map(prodCard).join('') + '</div></div>' +
    calcHTML('joelly') + '</div>';
}

/* --- Pemilih Mesin (logika sama dengan demo-pemilih-mesin) --- */
const machines = () => S.products.filter(p => p.products);
const juta = p => p.price / 1e6;
function pick(q, v) { return QUESTIONS[q].options.find(o => o.v === v); }
function ansLabel(i) { const a = S.pm.answers[QUESTIONS[i].key]; return a === undefined ? '' : pick(i, a).label; }
function score(m) {
  const a = S.pm.answers; let s = 0;
  if (a.product !== 'any') { if (m.products.indexOf(a.product) < 0) return -999; s += 100; }
  if (a.target >= m.cap[0] && a.target <= m.cap[1]) s += 30;
  else if (a.target > m.cap[1]) s -= 40 * (a.target - m.cap[1]);
  else s -= 10 * (m.cap[0] - a.target);
  if (a.power && m.watt > USABLE[a.power]) s -= 35;
  if (juta(m) > a.budget) s -= 50 + (juta(m) - a.budget); else s += 30;
  return s;
}
function ranked() { return machines().map(m => ({ m: m, s: score(m) })).filter(x => x.s > -999).sort((x, y) => y.s - x.s || x.m.price - y.m.price).map(x => x.m); }
function checks(m) {
  const a = S.pm.answers, out = [], w = m.watt.toLocaleString('id-ID') + ' W';
  out.push(a.product !== 'any' ? { t: 'Sesuai rencana Anda menjual ' + pick(0, a.product).label.toLowerCase() + '.' } : { t: 'Pilihan ini paling sesuai dengan modal, target, dan listrik yang Anda isi.' });
  if (a.target > m.cap[1]) out.push({ warn: 1, t: 'Kapasitas ' + m.capLabel + ', di bawah target Anda. Tanyakan opsi tambahan unit ke admin.' });
  else if (a.target < m.cap[0]) out.push({ warn: 1, t: 'Kapasitas ' + m.capLabel + ', lebih besar dari target Anda saat ini.' });
  else out.push({ t: 'Kapasitas ' + m.capLabel + ', sesuai target Anda.' });
  if (!a.power) out.push({ warn: 1, t: 'Mesin butuh sekitar ' + w + '. Cek daya di lokasi sebelum membeli, admin bisa bantu.' });
  else if (m.watt > USABLE[a.power]) out.push({ warn: 1, t: 'Mesin butuh sekitar ' + w + ', terlalu besar untuk ' + ansLabel(2) + '. Perlu naik daya atau jalur listrik terpisah.' });
  else out.push({ t: 'Butuh sekitar ' + w + ', masih aman untuk ' + ansLabel(2) + '.' });
  out.push(juta(m) > a.budget ? { warn: 1, t: 'Harga ' + rpS(m.price) + ', di atas anggaran Anda. Tanyakan paket yang lebih kecil ke admin.' } : { t: 'Harga masuk dalam anggaran Anda.' });
  return out;
}
function pmMessage(m) {
  const pm = S.pm, lines = ['Halo PIP Machinery, saya dari Pemilih Mesin di website.', ''];
  if (pm.name.trim()) lines.push('Nama: ' + pm.name.trim());
  if (pm.city.trim()) lines.push('Kota: ' + pm.city.trim());
  lines.push('Mau jual: ' + ansLabel(0), 'Target: ' + ansLabel(1) + ' per hari', 'Listrik: ' + ansLabel(2), 'Anggaran: ' + ansLabel(3), 'Rekomendasi: ' + m.name, '', 'Mohon info harga terbaru dan ketersediaannya.');
  return lines.join('\n');
}
function webPemilih() {
  const pm = S.pm;
  if (pm.step < QUESTIONS.length) {
    const i = pm.step, q = QUESTIONS[i], cur = pm.answers[q.key];
    const sheet = QUESTIONS.map((x, k) => { const v = ansLabel(k); return '<li>' + (v ? '<button class="sheet-row" type="button" data-act="pm-goto" data-i="' + k + '"><span>' + x.sheet + '</span><b>' + v + '</b></button>' : '<div class="sheet-row"><span>' + x.sheet + '</span><b class="no">Belum diisi</b></div>') + '</li>'; }).join('');
    return '<div class="pm"><section>' + (i === 0 ? '<h1 class="h2" style="margin-bottom:6px">Mesin mana yang pas untuk usaha Anda?</h1><p class="q-help">Jawab empat pertanyaan, langsung dapat rekomendasi mesin. Sebelum beli, mesinnya tetap bisa dicoba di toko.</p>' : '') +
      '<p class="step-count">Pertanyaan ' + (i + 1) + ' dari ' + QUESTIONS.length + '</p><h2 class="q">' + q.title + '</h2>' + (q.help ? '<p class="q-help">' + q.help + '</p>' : '') +
      '<div class="options">' + q.options.map((o, n) => '<button class="opt" type="button" data-act="pm-opt" data-n="' + n + '" aria-pressed="' + (cur === o.v) + '"><strong>' + o.label + '</strong>' + (o.hint ? '<small>' + o.hint + '</small>' : '') + '</button>').join('') + '</div>' +
      (i > 0 ? '<p style="margin-top:16px"><button class="link" type="button" data-act="pm-back">Kembali</button></p>' : '') + '</section>' +
      '<aside class="sheet' + (i === 0 && cur === undefined ? ' is-empty' : '') + '" aria-label="Jawaban Anda"><h3>Kebutuhan Anda</h3><ul>' + sheet + '</ul></aside></div>';
  }
  const list = ranked(), m = list[0], alt = list[1];
  return '<div class="pm" style="grid-template-columns:minmax(0,1fr) 340px"><section><h2 class="q" style="margin-bottom:16px">Rekomendasi untuk usaha Anda</h2>' +
    '<div class="plate"><p class="kicker">Paling sesuai</p><h3>' + esc(m.name) + '</h3><p style="margin-top:8px">' + esc(m.desc) + '</p>' +
    '<dl><div><dt>Harga</dt><dd>' + rpS(m.price) + '</dd></div><div><dt>Kapasitas</dt><dd>' + m.capLabel.replace('/hari', '') + '</dd></div><div><dt>Listrik</dt><dd>± ' + m.watt.toLocaleString('id-ID') + ' W</dd></div></dl>' +
    '<p class="small" style="margin-top:14px">' + (m.publik ? 'Harga dari halaman Paket Usaha sekarang. Kebutuhan listrik masih contoh.' : 'Harga dan spesifikasi masih data contoh.') + '</p></div>' +
    '<h3 style="font-size:20px;margin:22px 0 6px">Kenapa mesin ini</h3><ul>' + checks(m).map(c => '<li class="check' + (c.warn ? ' warn' : '') + '">' + c.t + '</li>').join('') + '</ul>' +
    '<h3 style="font-size:20px;margin:22px 0 6px">Yang akan rutin Anda butuhkan</h3><ul>' + NEEDS[m.products[0]].map(n => '<li class="check">' + n + '</li>').join('') + '</ul>' +
    (alt ? '<h3 style="font-size:20px;margin:22px 0 6px">Pilihan lain</h3><a class="card" style="display:block;text-decoration:none" href="#/web/produk/' + alt.id + '"><b>' + esc(alt.name) + '</b><br><span class="small muted">' + rpS(alt.price) + ' · ' + alt.capLabel + ' · ' + alt.watt.toLocaleString('id-ID') + ' W</span></a>' : '') +
    '<div class="btn-row" style="margin-top:18px"><a class="btn" href="#/web/modal/' + m.id + '">Hitung modal mesin ini</a><button class="link" type="button" data-act="pm-restart">Ulangi dari awal</button></div></section>' +
    '<aside class="card" style="border-color:var(--navy)"><h3>Lanjut bicara dengan admin</h3><p class="small muted" style="margin-bottom:12px">Jawaban Anda ikut terkirim, jadi tidak perlu menjelaskan dari awal.</p>' +
    '<label class="field">Nama<input id="pm-name" value="' + esc(S.pm.name) + '" autocomplete="name" placeholder="contoh: Andi"></label><label class="field">Kota<input id="pm-city" value="' + esc(S.pm.city) + '" placeholder="contoh: Yogyakarta"></label>' +
    '<p class="small" style="font-weight:600;color:var(--muted)">Pesan yang diterima admin</p><div class="bubble" id="pm-bubble"></div>' +
    '<button class="btn pri block" type="button" data-act="pm-send" data-p="' + m.id + '">Kirim lewat WhatsApp</button>' +
    '<button class="btn block" style="margin-top:8px" type="button" data-act="try" data-p="' + m.id + '">Jadwalkan coba mesin</button>' +
    '<p class="small muted" style="margin-top:10px">Di demo ini pesan masuk ke Pusat Chat tim.</p></aside></div>';
}
function updBubble() { const b = $('#pm-bubble'); if (b) b.textContent = pmMessage(ranked()[0]); }

/* ================= Layar pelanggan ================= */
function viewPelanggan() {
  const orders = S.orders.filter(o => active(o) && o.status !== 'Menunggu bayar').slice(0, 5);
  return '<p class="kicker">Layar pelanggan</p><h1 class="h2">Dibuka dari HP, tanpa aplikasi</h1><p class="lead" style="margin:8px 0 22px">Pelanggan membuka halaman ini lewat tautan di WhatsApp atau dengan scan QR yang menempel di mesin. Pilih contoh di bawah.</p>' +
    '<div class="cust-pick"><section class="card"><h3>Lacak pesanan</h3><p class="small muted" style="margin-bottom:8px">Status order, video QC, dan resi.</p><ul class="todo">' +
      orders.map(o => '<li><span class="dot"></span><a href="#/lacak/' + o.id + '"><b>' + o.id + '</b><small>' + esc(custLine(o.cust)) + ' · ' + o.status + '</small></a></li>').join('') + '</ul></section>' +
    '<section class="card"><h3>Halaman mitra</h3><p class="small muted" style="margin-bottom:8px">Pengingat bahan habis dan pesan ulang sekali tekan.</p><ul class="todo">' +
      S.customers.filter(c => c.mitra).map(c => { const r = refill(c); return '<li><span class="dot ' + (r && r.state !== 'Aman' ? 'o' : '') + '"></span><a href="#/mitra/' + c.id + '"><b>' + esc(c.name) + '</b><small>' + esc(c.city) + (r ? ' · ' + r.state : '') + '</small></a></li>'; }).join('') + '</ul></section>' +
    '<section class="card"><h3>Scan QR di mesin</h3><p class="small muted" style="margin-bottom:8px">Tutorial, garansi, lapor kendala, pesan bahan.</p><ul class="todo">' +
      S.units.map(u => '<li><span class="dot ' + (warrantyOn(u) ? 'g' : '') + '"></span><a href="#/qr/' + u.serial + '"><b>' + u.serial + ' · ' + esc(P(u.p).name) + '</b><small>' + esc(custLine(u.cust)) + '</small></a></li>').join('') + '</ul></section></div>';
}
function phonePage(head, body, side) {
  return '<div class="phone-wrap"><div class="phone"><div class="ph-head">' + head + '</div><div class="ph-body">' + body + '</div></div><div>' + side + '</div></div>';
}
function viewLacak(id) {
  const o = O((id || '').toUpperCase());
  if (!o) return siteFrame('lacak', '<div class="notice">Nomor order "' + esc(id) + '" tidak ditemukan.</div><div style="margin-top:16px">' + webLacakForm() + '</div>');
  if (o.id === S.tour.order) done('track');
  const fl = FLOW[o.kind].filter(s => s !== 'Selesai'), i = fl.indexOf(o.status), when = s => (o.log.find(l => l[0] === s) || [])[1];
  const label = { 'Menunggu bayar': 'Pesanan diterima', Desain: 'Desain gerobak', Produksi: 'Produksi gerobak', QC: 'Quality control', Packing: 'Packing', Dikirim: 'Dikirim ke ' + C(o.cust).city };
  const units = S.units.filter(u => u.order === o.id);
  const body = '<p class="ph-alert ' + (o.status === 'Dikirim' || o.status === 'Selesai' ? 'ok' : '') + '">' + (o.status === 'Selesai' ? 'Pesanan sudah diterima. Terima kasih.' : o.status === 'Dikirim' ? 'Pesanan dalam perjalanan.' : o.status === 'Menunggu bayar' ? 'Menunggu pembayaran ' + (o.kind === 'bahan' ? 'lunas' : 'DP') + '.' : 'Sedang dikerjakan: ' + label[o.status] + '.') + '</p>' +
    '<ol class="track">' + fl.map((s, k) => '<li class="' + (o.status === 'Selesai' || k < i ? 'done' : k === i ? 'now' : '') + '"><b>' + label[s] + '</b><small>' +
      (k <= i || o.status === 'Selesai' ? (when(s) ? fd(when(s)) : 'Selesai') + (s === 'QC' && o.qcSent ? ', ada video' : '') + (s === 'Dikirim' && o.resi ? ' · Resi ' + esc(o.resi) : '') : s === 'Dikirim' ? 'Nomor resi muncul di sini' : 'Menunggu') + '</small></li>').join('') + '</ol>' +
    (o.qcSent ? '<button class="ph-act" type="button" data-act="video" data-title="Video QC ' + o.id + '">Video QC sebelum dikirim <span>Putar</span></button>' : '') +
    '<div><p style="font-weight:700;margin-bottom:4px">Isi pesanan</p>' + o.items.map(it => '<div class="ph-item"><span><b>' + esc(P(it[0]).name) + '</b><small>' + it[1] + ' ' + P(it[0]).unit + '</small></span><b>' + rpS(P(it[0]).price * it[1]) + '</b></div>').join('') + '</div>' +
    '<div class="sum"><span>Total</span><b>' + rp(orderTotal(o)) + '</b><span>Sudah dibayar</span><b>' + rp(paidOf(o)) + '</b><span>Sisa</span><b>' + rp(left(o)) + '</b></div>' +
    units.map(u => '<a class="ph-act" href="#/qr/' + u.serial + '">Mesin terdaftar ' + u.serial + ', garansi aktif <span>Buka QR</span></a>').join('') +
    '<button class="ph-act" type="button" data-act="cust-chat" data-c="' + o.cust + '" data-ctx="' + o.id + '">Chat admin soal pesanan ini <span>Tulis</span></button>';
  return phonePage('<small>Pesanan ' + o.id + ' · ' + esc(custLine(o.cust)) + '</small><b>' + esc(itemsText(o)) + '</b>', body,
    '<p class="kicker">Lacak pesanan</p><h1 class="h2">Pelanggan tidak perlu bertanya "sudah sampai mana?"</h1><p class="lead" style="margin:10px 0 16px">Halaman ini ikut berubah setiap kali tim memajukan status order di sistem. Tautannya dikirim otomatis lewat WhatsApp.</p>' +
    '<div class="btn-row"><a class="btn dark" href="#/tim/order/' + o.id + '">Lihat order ini dari sisi tim</a><a class="btn" href="#/pelanggan">Contoh lain</a></div>');
}
function viewMitra(cid) {
  const c = C(cid); if (!c || !c.mitra) return '<p class="empty">Halaman mitra tidak ditemukan. <a href="#/pelanggan">Kembali</a></p>';
  const r = refill(c), last = r && r.order;
  if (!S.carts[cid]) S.carts[cid] = last ? last.items.map(it => [it[0], it[1]]) : [['bahan-coklat', 5]];
  const cart = S.carts[cid], tot = sum(cart, it => P(it[0]).price * it[1]);
  const fresh = S.orders.filter(o => o.cust === cid && o.kind === 'bahan' && active(o));
  const news = S.products.filter(p => p.baru && !cart.some(it => it[0] === p.id));
  const units = S.units.filter(u => u.cust === cid);
  const remind = 'Halo ' + c.name + ', bahan dari pesanan ' + (last ? last.id : '') + ' diperkirakan habis ' + (r ? (r.daysLeft >= 0 ? r.daysLeft + ' hari lagi' : 'sejak ' + fd(r.end)) : '') + '. Mau pesan seperti terakhir? Pesan sekali tekan di: pipmachinery.id/mitra';
  const body = (fresh.length ? '<p class="ph-alert ok">Pesanan ' + fresh[0].id + ' sedang diproses: ' + fresh[0].status + '. <a href="#/lacak/' + fresh[0].id + '">Lacak</a></p>' :
      r ? '<p class="ph-alert">' + (r.daysLeft >= 0 ? 'Bahan diperkirakan habis ' + r.daysLeft + ' hari lagi.' : 'Bahan diperkirakan sudah habis sejak ' + fd(r.end) + '.') + '</p>' : '') +
    '<div><p style="font-weight:700">Pesan seperti terakhir' + (last ? ' <span class="small faint">(' + last.id + ', ' + fds(last.date) + ')</span>' : '') + '</p>' +
    cart.map((it, k) => '<div class="ph-item"><span><b>' + esc(P(it[0]).name) + '</b><small>' + rp(P(it[0]).price) + ' / ' + P(it[0]).unit + '</small></span><span class="qty"><button type="button" data-act="cart" data-c="' + cid + '" data-k="' + k + '" data-d="-1" aria-label="Kurangi ' + esc(P(it[0]).name) + '">−</button><span>' + it[1] + '</span><button type="button" data-act="cart" data-c="' + cid + '" data-k="' + k + '" data-d="1" aria-label="Tambah ' + esc(P(it[0]).name) + '">+</button></span></div>').join('') + '</div>' +
    (news.length ? '<div><p style="font-weight:700">Varian baru bulan ini</p>' + news.map(p => '<div class="ph-item"><span><b>' + esc(p.name) + '</b><small>' + rp(p.price) + ' / ' + p.unit + '</small></span><button class="btn sm" type="button" data-act="cart-add" data-c="' + cid + '" data-p="' + p.id + '">Tambah</button></div>').join('') + '</div>' : '') +
    '<div class="sum"><span>Total</span><b>' + rp(tot) + '</b></div>' +
    '<button class="btn pri block" type="button" data-act="reorder" data-c="' + cid + '"' + (tot ? '' : ' disabled') + '>Pesan lagi</button>' +
    units.map(u => '<a class="ph-act" href="#/qr/' + u.serial + '">' + esc(P(u.p).name) + ' <span>Buka QR</span></a>').join('') +
    '<div><p style="font-weight:700">Riwayat pesanan</p>' + S.orders.filter(o => o.cust === cid).slice(0, 4).map(o => '<a class="ph-item" style="text-decoration:none" href="#/lacak/' + o.id + '"><span><b>' + o.id + '</b><small>' + fd(o.date) + ' · ' + o.status + '</small></span><b>' + rpS(orderTotal(o)) + '</b></a>').join('') + '</div>';
  return phonePage('<small>Halaman mitra · ' + esc(c.city) + '</small><b>Halo, ' + esc(c.name) + '</b>', body,
    '<p class="kicker">Halaman mitra</p><h1 class="h2">Pesan ulang tanpa mengetik dari awal</h1><p class="lead" style="margin:10px 0 16px">Pesanan terakhir sudah terisi. Mitra cukup ubah jumlahnya lalu tekan Pesan lagi. Order langsung masuk ke menu Penjualan.</p>' +
    '<p class="small" style="font-weight:600;color:var(--muted)">Pengingat yang dikirim sistem lewat WhatsApp' + (c.consent ? '' : ' (pelanggan ini belum setuju dikirimi pengingat)') + '</p><div class="bubble" style="background:#fff;border:1px solid var(--line)">' + esc(remind) + '</div>' +
    '<div class="btn-row"><a class="btn dark" href="#/tim/pelanggan/pengingat">Lihat daftar pengingat di sisi tim</a></div>');
}
function viewQR(serial) {
  const u = U(serial); if (!u) return '<p class="empty">Mesin tidak ditemukan. <a href="#/pelanggan">Kembali</a></p>';
  const p = P(u.p), c = C(u.cust), on = warrantyOn(u), open = S.tickets.filter(t => t.serial === u.serial && t.status !== 'Selesai');
  const tuts = TUTORIALS[u.p] || ['Cara memakai', 'Cara membersihkan', 'Perawatan rutin'];
  const body = '<p class="ph-alert ' + (on ? 'ok' : '') + '">' + (on ? 'Garansi aktif sampai ' + fd(warrantyEnd(u)) + '.' : 'Garansi berakhir ' + fd(warrantyEnd(u)) + '. Servis tetap bisa, dengan biaya.') + '</p>' +
    open.map(t => '<p class="ph-alert">Tiket ' + t.id + ': ' + esc(t.issue) + '. Status: ' + t.status + (t.when ? ', ' + fd(t.when) : '') + '.</p>').join('') +
    '<div><p style="font-weight:700;margin-bottom:6px">Video tutorial</p>' + tuts.map(t => '<button class="ph-act" type="button" data-act="video" data-title="' + esc(t) + '" style="margin-bottom:6px">' + esc(t) + ' <span>Putar</span></button>').join('') + '</div>' +
    '<form data-form="ticket" class="card" style="padding:14px"><input type="hidden" name="serial" value="' + u.serial + '"><p style="font-weight:700;margin-bottom:8px">Lapor kendala</p>' +
      '<label class="field">Kendalanya<select name="issue"><option>Hasil es terlalu cair</option><option>Mesin berbunyi keras</option><option>Mesin tidak dingin</option><option>Mesin tidak menyala</option><option>Lainnya</option></select></label>' +
      '<label class="field">Keterangan (boleh dikosongkan)<textarea name="note" placeholder="contoh: sejak kemarin sore"></textarea></label>' +
      '<button class="btn pri block" type="submit">Kirim ke teknisi</button><p class="small muted" style="margin-top:6px">Data mesin, tanggal beli, dan garansi ikut terkirim.</p></form>' +
    (c.mitra ? '<a class="ph-act" href="#/mitra/' + c.id + '">Pesan bahan <span>Pilih</span></a>' : '') +
    '<button class="ph-act" type="button" data-act="cust-chat" data-c="' + c.id + '" data-ctx="mesin ' + u.serial + '">Chat admin <span>Tulis</span></button>';
  return phonePage('<small>Hasil scan QR · ' + u.serial + '</small><b>' + esc(p.name) + '</b><small style="margin-top:4px">' + esc(custLine(c.id)) + ' · dibeli ' + fd(u.sold) + '</small>', body,
    '<p class="kicker">QR di setiap mesin</p><h1 class="h2">Sekali scan, panduan dan garansi langsung muncul</h1><p class="lead" style="margin:10px 0 16px">Stiker QR ditempel saat mesin dikirim. Laporan kendala masuk ke menu Servis lengkap dengan tipe mesin, tanggal beli, dan status garansi.</p>' +
    '<div class="btn-row"><a class="btn dark" href="#/tim/servis">Lihat menu Servis di sisi tim</a></div>');
}

/* ================= Sistem tim ================= */
const MODS = [['dasbor', 'Dasbor'], ['chat', 'Pusat chat'], ['prospek', 'Prospek'], ['penjualan', 'Penjualan'], ['stok', 'Stok'], ['produksi', 'Produksi gerobak'], ['servis', 'Servis'], ['keuangan', 'Keuangan'], ['pelanggan', 'Pelanggan'], ['laporan', 'Laporan']];
function viewTim(r) {
  const mod = r[1] || 'dasbor';
  const navMod = mod === 'order' ? 'penjualan' : mod;
  const views = { dasbor: timDasbor, chat: timChat, prospek: timProspek, penjualan: timPenjualan, order: timOrder, stok: timStok, produksi: timProduksi, servis: timServis, keuangan: timKeuangan, pelanggan: timPelanggan, laporan: timLaporan };
  const cur = MODS.find(m => m[0] === navMod) || MODS[0];
  const inner = (views[mod] || timDasbor)(r[2]), b = badges();
  return '<div class="erp"><aside class="erp-side no-print"><button class="erp-menu-btn" type="button" data-act="menu" aria-expanded="false"><span>Menu: ' + cur[1] + '</span><span aria-hidden="true">☰</span></button><nav class="erp-navs" aria-label="Modul sistem">' +
    MODS.map(m => '<a class="erp-nav" href="#/tim/' + m[0] + '"' + (m[0] === navMod ? ' aria-current="page"' : '') + '>' + ic(m[0]) + '<span>' + m[1] + '</span>' + (b[m[0]] ? '<em>' + b[m[0]] + '</em>' : '') + '</a>').join('') + '</nav>' +
    '<div class="erp-user"><span class="av">' + S.user.slice(0, 2).toUpperCase() + '</span><label>Masuk sebagai <select data-act-change="user">' + ADMINS.concat(['Pemilik']).map(a => '<option' + (a === S.user ? ' selected' : '') + '>' + a + '</option>').join('') + '</select></label></div></aside>' +
    '<div class="erp-main">' + inner + '</div></div>';
}
function title(h, sub, acts) { return '<div class="erp-title"><div><h1>' + h + '</h1>' + (sub ? '<small>' + sub + '</small>' : '') + '</div>' + (acts ? '<div class="btn-row no-print">' + acts + '</div>' : '') + '</div>'; }
function td(label, html, cls) { return '<td data-l="' + label + '"' + (cls ? ' class="' + cls + '"' : '') + '><span>' + html + '</span></td>'; }

/* --- Dasbor --- */
const novOrders = () => S.orders.filter(o => o.date >= '2026-11-01');
function chart() {
  const vals = HISTORY.map(h => h[1]).concat([sum(novOrders(), orderTotal)]), labels = HISTORY.map(h => h[0]).concat(['Nov*']);
  const W = 560, H = 200, pad = 34, max = 150e6, y = v => H - 28 - v / max * (H - 48);
  const pts = vals.map((v, i) => [pad + i * (W - pad * 2) / (vals.length - 1), y(v)]);
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Penjualan Juni sampai November">' +
    [50e6, 100e6, 150e6].map(g => '<line x1="' + pad + '" x2="' + (W - 10) + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="#dceef7"/><text x="0" y="' + (y(g) + 4) + '" font-size="11" fill="#6b7f95">' + g / 1e6 + ' jt</text>').join('') +
    '<polyline points="' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '" fill="none" stroke="#ea580c" stroke-width="3" stroke-linejoin="round"/>' +
    pts.map((p, i) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="' + (i === pts.length - 1 ? '#ea580c' : '#fff') + '" stroke="#ea580c" stroke-width="2"/><text x="' + p[0] + '" y="' + (H - 8) + '" font-size="12" text-anchor="middle" fill="#6b7f95">' + labels[i] + '</text><text x="' + p[0] + '" y="' + (p[1] - 10) + '" font-size="11" font-weight="700" text-anchor="middle" fill="#072d59">' + Math.round(vals[i] / 1e6) + '</text>').join('') + '</svg>';
}
function salesByLine(orders) {
  const m = {};
  orders.forEach(o => o.items.forEach(it => { const k = lineOf(it[0]); m[k] = (m[k] || 0) + P(it[0]).price * it[1]; }));
  return Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1]);
}
function bars(rows, fmt) { const mx = Math.max.apply(null, rows.map(r => r[1]).concat([1])); return '<div class="bars">' + rows.map(r => '<div class="b"><span>' + r[0] + '</span><span class="t"><i style="width:' + (r[1] / mx * 100) + '%"></i></span><b>' + (fmt ? fmt(r[1]) : r[1]) + '</b></div>').join('') + '</div>'; }
function todos() {
  const out = [];
  const fl = S.leads.filter(l => l.stage !== 'Jadi order' && l.follow <= TODAY);
  if (fl.length) out.push(['o', fl.length + ' prospek perlu di-follow up hari ini', fl.slice(0, 3).map(l => l.name + ', ' + l.city).join(' · '), '#/tim/prospek']);
  const unread = S.chats.filter(c => c.unread);
  if (unread.length) out.push(['o', unread.length + ' chat belum dibalas', unread.slice(0, 3).map(c => c.name).join(' · '), '#/tim/chat/' + unread[0].id]);
  const tk = S.tickets.filter(t => t.status === 'Menunggu teknisi' || t.status === 'Baru');
  if (tk.length) out.push(['o', tk.length + ' tiket servis menunggu teknisi', tk.map(t => t.id + ' ' + C(U(t.serial).cust).city).join(' · '), '#/tim/servis']);
  const due = S.orders.filter(o => left(o) > 0 && diff(TODAY, o.due) <= 0);
  if (due.length) out.push(['b', due.length + ' faktur jatuh tempo', due.map(o => invOf(o) + ' · ' + custName(o.cust) + ' · ' + rpS(left(o))).join(' · '), '#/tim/keuangan']);
  const low = lowItems();
  if (low.length) out.push(['b', low.length + ' item stok di bawah minimum', low.map(p => p.name.replace('Bahan soft Joelly ', '')).join(', '), '#/tim/stok']);
  const ship = S.orders.filter(o => o.status === 'Packing' && isLunas(o));
  if (ship.length) out.push(['g', ship.length + ' order siap dikirim', ship.map(o => o.id + ' ' + custName(o.cust)).join(' · '), '#/tim/order/' + ship[0].id]);
  const rem = S.customers.filter(c => c.mitra && c.consent && !c.reminded && (r => r && !r.fresh && r.state !== 'Aman')(refill(c)));
  if (rem.length) out.push(['g', rem.length + ' mitra perlu diingatkan pesan bahan', rem.map(c => c.name).join(' · '), '#/tim/pelanggan/pengingat']);
  return out;
}
function timDasbor() {
  const nov = novOrders(), novSum = sum(nov, orderTotal), act = S.orders.filter(o => active(o));
  const openLeads = S.leads.filter(l => l.stage !== 'Jadi order');
  return title('Selamat pagi, ' + (S.user === 'Pemilik' ? 'Pak' : S.user), fdl(TODAY) + ' · data contoh', '<a class="btn" href="#/tim/laporan">Laporan bulanan</a><button class="btn pri" type="button" data-act="new-order">+ Order baru</button>') +
    '<div class="kpis"><a class="kpi" href="#/tim/penjualan"><small>Penjualan November</small><b>' + rpS(novSum) + '</b><em>' + nov.length + ' order sampai ' + fds(TODAY) + '</em></a>' +
    '<a class="kpi" href="#/tim/penjualan"><small>Order aktif</small><b>' + act.length + '</b><em>' + act.filter(o => o.status === 'Packing').length + ' di packing</em></a>' +
    '<a class="kpi" href="#/tim/prospek"><small>Prospek berjalan</small><b>' + openLeads.length + '</b><em class="up">' + openLeads.filter(l => l.src === 'Pemilih Mesin').length + ' dari Pemilih Mesin</em></a>' +
    '<a class="kpi' + (lowItems().length ? ' warn' : '') + '" href="#/tim/stok"><small>Stok di bawah minimum</small><b>' + lowItems().length + ' item</b><em>Perlu dipesan minggu ini</em></a></div>' +
    '<div class="cols"><section class="panel"><div class="panel-head"><h2>Penjualan 6 bulan terakhir (juta rupiah)</h2></div>' + chart() + '<p class="small faint">* November sampai ' + fd(TODAY) + ', dihitung dari order di sistem. Bulan sebelumnya angka contoh.</p></section>' +
    '<section class="panel"><h2>Perlu tindakan hari ini</h2><ul class="todo">' + (todos().map(t => '<li><span class="dot ' + t[0] + '"></span><a href="' + t[3] + '"><b>' + t[1] + '</b><small>' + esc(t[2]) + '</small></a></li>').join('') || '<li class="empty">Semua beres.</li>') + '</ul></section></div>' +
    '<div class="cols"><section class="panel"><h2>Penjualan November per lini</h2>' + bars(salesByLine(nov), rpS) + '</section>' +
    '<section class="panel"><h2>Aktivitas terbaru</h2><ul class="feed">' + S.log.slice(0, 7).map(l => '<li><small>' + l.t + '</small>' + esc(l.text) + '</li>').join('') + '</ul></section></div>';
}

/* --- Pusat chat --- */
function timChat(id) {
  const ch = id ? CH(id) : null, open = ch || S.chats[0];
  if (ch && ch.unread) { ch.unread = 0; save(); }
  const list = S.chats.map(c => '<a class="chat-item" href="#/tim/chat/' + c.id + '" aria-current="' + (open && c.id === open.id) + '" style="text-decoration:none"><span class="row1"><b>' + esc(c.name) + ', ' + esc(c.city) + '</b>' + (c.unread ? '<em>' + c.unread + '</em>' : '') + '</span>' +
    '<p>' + esc((c.msgs[c.msgs.length - 1] || ['', ''])[1]) + '</p><span class="tags">' + st(c.channel, 'mute') + st(c.label, c.label === 'Prospek' ? 'warn' : c.label === 'Servis' ? '' : 'ok') + st(c.admin, 'mute') + '</span></a>').join('');
  let main = '<p class="empty">Belum ada chat.</p>';
  if (open) {
    const lead = open.lead && L(open.lead), cust = open.cust && C(open.cust);
    const actOrder = cust && S.orders.find(o => o.cust === cust.id && active(o));
    const unpaid = cust && S.orders.find(o => o.cust === cust.id && left(o) > 0);
    const quick = [];
    if (lead) quick.push(['Kirim brosur', 'Berikut brosur ' + P(lead.p).name + ': harga ' + rp(P(lead.p).price) + ', garansi dan video QC sebelum kirim. Mesin juga bisa dicoba dulu di toko Bantul.']);
    if (lead) quick.push(['Ajak coba mesin', 'Mesinnya ready di Bantul. Mau coba langsung di toko, atau lewat video call dulu?']);
    if (unpaid) quick.push(['Kirim tagihan', 'Tagihan ' + invOf(unpaid) + ' untuk ' + unpaid.id + ': sisa ' + rp(left(unpaid)) + ', jatuh tempo ' + fd(unpaid.due) + '. Transfer ke BCA 123-456-7890 a.n. CV Maurindo Purnama Abadi (contoh).']);
    if (actOrder) quick.push(['Kirim link lacak', 'Status pesanan ' + actOrder.id + ' bisa dilihat di: pipmachinery.id/lacak/' + actOrder.id]);
    main = '<div class="chat-top"><div><a class="btn sm back-btn" href="#/tim/chat" style="margin-bottom:6px">← Semua chat</a><b>' + esc(open.name) + ', ' + esc(open.city) + '</b><br><span class="small faint">' + open.channel + ' · nomor bersama PIP Machinery</span></div>' +
      '<div class="btn-row"><label class="small">Ditangani <select data-act-change="assign" data-id="' + open.id + '">' + ADMINS.map(a => '<option' + (a === open.admin ? ' selected' : '') + '>' + a + '</option>').join('') + '</select></label>' +
      (lead ? '<button class="btn sm" type="button" data-act="lead" data-id="' + lead.id + '">Prospek: ' + lead.stage + '</button>' : cust ? '<a class="btn sm" href="#/tim/pelanggan/' + cust.id + '">Data pelanggan</a>' : '<button class="btn sm" type="button" data-act="to-lead" data-id="' + open.id + '">Jadikan prospek</button>') + '</div></div>' +
      '<div class="msgs" aria-live="polite">' + open.msgs.map(m => '<div class="msg ' + m[0] + '">' + esc(m[1]) + (m[0] !== 'sys' ? '<time>' + esc(m[2]) + '</time>' : '') + '</div>').join('') + '</div>' +
      '<div class="compose">' + (quick.length ? '<div class="chips">' + quick.map((q, k) => '<button class="chip" type="button" data-act="quick" data-id="' + open.id + '" data-text="' + esc(q[1]) + '">' + q[0] + '</button>').join('') + '</div>' : '') +
      '<form data-form="send"><input type="hidden" name="id" value="' + open.id + '"><label class="sr" for="msg-in">Tulis balasan</label><input id="msg-in" name="text" autocomplete="off" placeholder="Tulis balasan sebagai ' + esc(S.user) + '…"><button class="btn pri" type="submit">Kirim</button></form></div>';
  }
  return title('Pusat chat', 'Satu nomor WhatsApp dan DM Instagram, dibagi ke ' + ADMINS.length + ' admin. Semua chat tercatat.') +
    '<div class="chat' + (ch ? ' has-open' : '') + '"><div class="chat-list">' + list + '</div><div class="chat-main">' + main + '</div></div>';
}

/* --- Prospek --- */
function timProspek(filter) {
  const srcs = ['Semua'].concat(Array.from(new Set(S.leads.map(l => l.src))));
  const f = filter ? decodeURIComponent(filter) : 'Semua';
  const leads = S.leads.filter(l => f === 'Semua' || l.src === f);
  const open = S.leads.filter(l => l.stage !== 'Jadi order');
  return title('Prospek', open.length + ' prospek berjalan · nilai potensi ' + rpS(sum(open, l => P(l.p).price)), '<button class="btn pri" type="button" data-act="new-lead">+ Prospek</button>') +
    '<div class="tabs" role="group" aria-label="Asal prospek">' + srcs.map(s => '<a class="chip" href="#/tim/prospek/' + encodeURIComponent(s) + '" aria-pressed="' + (s === f) + '">' + s + '</a>').join('') + '</div>' +
    '<div class="kb">' + STAGES.map(sg => { const cs = leads.filter(l => l.stage === sg);
      return '<div class="kb-col"><div class="kb-head"><span>' + sg + '</span><em>' + cs.length + '</em></div>' + cs.map(l =>
        '<button class="kb-card' + (l.follow <= TODAY && sg !== 'Jadi order' ? ' hot' : '') + '" type="button" data-act="lead" data-id="' + l.id + '"><b>' + esc(l.name) + ', ' + esc(l.city) + '</b><span>' + esc(P(l.p).name) + '</span>' +
        '<span class="kb-foot"><small>' + esc(l.src) + '</small><strong>' + rpS(P(l.p).price) + '</strong></span><small>' + (sg === 'Jadi order' ? 'Order ' + (l.order || '') : 'Follow up ' + (l.follow <= TODAY ? 'hari ini' : fds(l.follow))) + '</small></button>').join('') + '</div>'; }).join('') + '</div>';
}
function leadModal(l) {
  modal(esc(l.name) + ', ' + esc(l.city),
    '<dl class="spec" style="margin-top:0"><dt>Minat</dt><dd>' + esc(P(l.p).name) + ' · ' + rpS(P(l.p).price) + '</dd><dt>Asal</dt><dd>' + esc(l.src) + '</dd><dt>Masuk</dt><dd>' + fd(l.created) + '</dd>' +
    (l.answers ? '<dt>Jawaban</dt><dd>' + l.answers.map(esc).join(' · ') + '</dd>' : '') + (l.note ? '<dt>Catatan</dt><dd>' + esc(l.note) + '</dd>' : '') + (l.order ? '<dt>Order</dt><dd><a href="#/tim/order/' + l.order + '" data-act="close-go">' + l.order + '</a></dd>' : '') + '</dl>' +
    '<p class="small" style="font-weight:700;margin-bottom:6px">Pindah tahap</p><div class="chips" style="margin-bottom:14px">' + STAGES.filter(s => s !== 'Jadi order').map(s => '<button class="chip" type="button" data-act="stage" data-id="' + l.id + '" data-s="' + s + '" aria-pressed="' + (l.stage === s) + '">' + s + '</button>').join('') + '</div>' +
    '<form data-form="follow" class="btn-row" style="margin-bottom:16px"><input type="hidden" name="id" value="' + l.id + '"><label class="field" style="margin:0;flex:1">Pengingat follow up<input type="date" name="date" value="' + l.follow + '" min="' + TODAY + '"></label><button class="btn" type="submit" style="align-self:flex-end">Simpan</button></form>' +
    '<div class="btn-row">' + (l.stage !== 'Jadi order' ? '<button class="btn pri" type="button" data-act="lead-order" data-id="' + l.id + '">Buat order</button>' : '') + (l.chat ? '<a class="btn" href="#/tim/chat/' + l.chat + '" data-act="close-go">Buka chat</a>' : '') + '</div>');
}
function orderForm(pre) {
  const opts = sel => '<option value="">—</option>' + S.products.map(p => '<option value="' + p.id + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(p.name) + ' · ' + rpS(p.price) + '</option>').join('');
  const items = (pre.items || []).concat([['', 1], ['', 1]]).slice(0, 3);
  return '<form data-form="order"><input type="hidden" name="lead" value="' + (pre.lead || '') + '">' +
    '<div class="grid g2" style="gap:0 12px"><label class="field">Nama pelanggan<input name="name" required value="' + esc(pre.name || '') + '" list="cust-list"></label><label class="field">Kota<input name="city" required value="' + esc(pre.city || '') + '"></label></div>' +
    '<datalist id="cust-list">' + S.customers.map(c => '<option value="' + esc(c.name) + '">').join('') + '</datalist>' +
    items.map((it, k) => '<div class="grid" style="grid-template-columns:minmax(0,1fr) 80px;gap:0 10px"><label class="field">Item ' + (k + 1) + '<select name="p' + k + '">' + opts(it[0]) + '</select></label><label class="field">Jumlah<input type="number" name="q' + k + '" min="1" value="' + it[1] + '"></label></div>').join('') +
    '<p class="small muted" style="margin-bottom:12px">Status awal: Menunggu bayar. Faktur dibuat otomatis di menu Keuangan.</p><button class="btn pri block" type="submit">Simpan order</button></form>';
}

/* --- Penjualan --- */
function timPenjualan(tab) {
  const tabs = [['aktif', 'Semua aktif', o => active(o)], ['bayar', 'Menunggu bayar', o => o.status === 'Menunggu bayar'], ['proses', 'Diproses', o => ['Desain', 'Produksi', 'QC', 'Packing'].indexOf(o.status) >= 0], ['kirim', 'Dikirim', o => o.status === 'Dikirim'], ['selesai', 'Selesai', o => o.status === 'Selesai']];
  const t = tabs.find(x => x[0] === tab) || tabs[0], rows = S.orders.filter(t[2]).sort((a, b) => a.id < b.id ? 1 : -1);
  return title('Penjualan', S.orders.filter(active).length + ' order aktif · mesin, bahan, gerobak, dan paket usaha', '<button class="btn pri" type="button" data-act="new-order">+ Order baru</button>') +
    '<div class="tabs">' + tabs.map(x => '<a class="chip" href="#/tim/penjualan/' + x[0] + '" aria-pressed="' + (x === t) + '">' + x[1] + ' ' + S.orders.filter(x[2]).length + '</a>').join('') + '</div>' +
    '<div class="panel"><table class="tbl cards"><thead><tr><th>No. order</th><th>Pelanggan</th><th>Item</th><th class="r">Total</th><th>Bayar</th><th>Status</th></tr></thead><tbody>' +
    (rows.map(o => '<tr class="click' + (o.id === S.tour.order ? ' fresh' : '') + '" data-href="#/tim/order/' + o.id + '">' + td('No. order', '<a href="#/tim/order/' + o.id + '"><b>' + o.id + '</b></a><small>' + fds(o.date) + '</small>') + td('Pelanggan', '<b>' + esc(custName(o.cust)) + '</b><small>' + esc(C(o.cust).city) + '</small>') +
      td('Item', esc(itemsText(o))) + td('Total', '<b>' + rpS(orderTotal(o)) + '</b>', 'r') + td('Bayar', payPill(o)) + td('Status', statusPill(o.status)) + '</tr>').join('') || '<tr><td colspan="6" class="empty">Tidak ada order.</td></tr>') + '</tbody></table></div>';
}
function timOrder(id) {
  const o = O(id); if (!o) return '<p class="empty">Order tidak ditemukan.</p>';
  const fl = FLOW[o.kind], i = fl.indexOf(o.status), c = C(o.cust), can = canAdvance(o);
  const units = S.units.filter(u => u.order === o.id);
  let action = '';
  if (can.next) action = can.ok ? '<button class="btn pri" type="button" data-act="advance" data-id="' + o.id + '">Lanjut ke: ' + can.next + '</button>' : '<div class="notice" style="margin-bottom:10px">' + can.why + '</div>';
  return title('Order ' + o.id, esc(custLine(o.cust)) + ' · dibuat ' + fd(o.date) + (o.src ? ' · dari ' + esc(o.src) : ''), '<a class="btn" href="#/lacak/' + o.id + '">Halaman lacak pelanggan</a><a class="btn" href="#/tim/penjualan">Semua order</a>') +
    '<div class="cols"><section class="panel"><div class="panel-head"><h2>Status</h2>' + statusPill(o.status) + '</div><ol class="steps">' + fl.map((s, k) => '<li class="' + (k < i ? 'done' : k === i ? 'now' : '') + '">' + s + '</li>').join('') + '</ol>' +
      '<div class="btn-row">' + action + (o.status === 'QC' ? '<button class="btn" type="button" data-act="qc" data-id="' + o.id + '"' + (o.qcSent ? ' disabled' : '') + '>' + (o.qcSent ? 'Video QC terkirim' : 'Kirim video QC ke pelanggan') + '</button>' : '') +
        (active(o) && o.status !== 'Menunggu bayar' ? '<button class="btn" type="button" data-act="send-track" data-id="' + o.id + '">Kirim link lacak ke chat</button>' : '') + '</div>' +
      (o.note ? '<p class="small muted" style="margin-top:12px">Catatan: ' + esc(o.note) + '</p>' : '') + (o.resi ? '<p style="margin-top:12px"><b>Resi:</b> ' + esc(o.resi) + '</p>' : '') +
      '<h2 style="font-size:17px;margin:18px 0 6px">Riwayat</h2><ul class="feed">' + o.log.slice().reverse().map(l => '<li><small>' + fd(l[1]) + '</small>' + l[0] + '</li>').join('') + '</ul></section>' +
    '<section class="panel"><h2>Isi order</h2><table class="tbl"><tbody>' + o.items.map(it => '<tr><td>' + esc(P(it[0]).name) + '<small>' + it[1] + ' ' + P(it[0]).unit + ' × ' + rp(P(it[0]).price) + '</small></td><td class="r"><b>' + rpS(P(it[0]).price * it[1]) + '</b></td></tr>').join('') + '</tbody></table>' +
      '<div class="sum"><span>Total</span><b>' + rp(orderTotal(o)) + '</b><span>Dibayar</span><b>' + rp(paidOf(o)) + '</b><span>Sisa</span><b style="color:' + (left(o) ? 'var(--orange-deep)' : 'var(--ok)') + '">' + rp(left(o)) + '</b></div>' +
      '<p class="small faint" style="margin-top:6px">Faktur ' + invOf(o) + ' · jatuh tempo ' + fd(o.due) + '</p>' +
      (left(o) ? '<button class="btn dark block" style="margin-top:12px" type="button" data-act="pay" data-id="' + o.id + '">Catat pembayaran</button>' : '') +
      (o.pays.length ? '<h2 style="font-size:17px;margin:18px 0 6px">Pembayaran</h2><ul class="feed">' + o.pays.map(p => '<li><small>' + fd(p.date) + '</small>' + rp(p.amt) + ' · ' + esc(p.note) + '</li>').join('') + '</ul>' : '') +
      (units.length ? '<h2 style="font-size:17px;margin:18px 0 6px">Mesin terdaftar</h2>' + units.map(u => '<p><a href="#/qr/' + u.serial + '">' + u.serial + '</a> · garansi sampai ' + fd(warrantyEnd(u)) + '</p>').join('') : '') +
      '<p style="margin-top:14px"><a href="#/tim/pelanggan/' + c.id + '">Data pelanggan ' + esc(c.name) + '</a></p></section></div>';
}

/* --- Stok --- */
function timStok(cat) {
  const cats = ['semua', 'mesin', 'paket', 'bahan', 'cone', 'topping', 'alat'], f = cat || 'semua';
  const rows = S.products.filter(p => p.stock != null && (f === 'semua' || p.cat === f)).sort((a, b) => (a.stock < a.min ? 0 : 1) - (b.stock < b.min ? 0 : 1));
  return title('Stok', 'Gudang Bantul · ' + lowItems().length + ' item di bawah minimum', '<button class="btn" type="button" data-act="stock-in">Stok masuk</button><button class="btn pri" type="button" data-act="po">Buat pesanan ke pemasok</button>') +
    '<div class="tabs">' + cats.map(c => '<a class="chip" href="#/tim/stok/' + c + '" aria-pressed="' + (c === f) + '">' + (c === 'semua' ? 'Semua' : CAT_LABEL[c]) + '</a>').join('') + '</div>' +
    '<div class="panel"><table class="tbl cards"><thead><tr><th>Item</th><th>Kategori</th><th class="r">Harga jual</th><th class="r">Stok</th><th style="width:22%">Terhadap minimum</th><th>Status</th></tr></thead><tbody>' +
    rows.map(p => { const low = p.stock < p.min; return '<tr>' + td('Item', '<b>' + esc(p.name) + '</b>') + td('Kategori', CAT_LABEL[p.cat]) + td('Harga jual', rp(p.price), 'r') + td('Stok', '<b>' + p.stock.toLocaleString('id-ID') + '</b> ' + p.unit, 'r') +
      td('Minimum', '<span class="lvl"><i class="' + (low ? 'low' : '') + '" style="width:' + Math.min(100, p.stock / (p.min * 2) * 100) + '%"></i></span><small>min. ' + p.min + ' ' + p.unit + '</small>') + td('Status', low ? st('Pesan ulang', 'warn') : st('Aman', 'ok')) + '</tr>'; }).join('') +
    '</tbody></table><p class="small faint" style="margin-top:8px">Stok berkurang otomatis saat order berstatus Dikirim. Harga di sini yang tampil di website.</p></div>';
}

/* --- Produksi --- */
function timProduksi() {
  const cols = ['Desain', 'Produksi', 'QC', 'Packing', 'Dikirim'];
  const jobs = S.orders.filter(o => o.kind !== 'bahan' && cols.indexOf(o.status) >= 0);
  return title('Produksi gerobak dan QC', jobs.length + ' pekerjaan berjalan · gerobak custom rata-rata 9 hari kerja', '<button class="btn pri" type="button" data-act="new-order">+ Pesanan custom</button>') +
    '<div class="kb">' + cols.map(c => { const js = jobs.filter(o => o.status === c);
      return '<div class="kb-col"><div class="kb-head"><span>' + c + '</span><em>' + js.length + '</em></div>' + js.map(o => { const fl = FLOW[o.kind];
        return '<a class="kb-card" style="text-decoration:none" href="#/tim/order/' + o.id + '"><b>' + o.id + '</b><span>' + esc(custLine(o.cust)) + '</span><small>' + esc(itemsText(o)) + '</small>' +
          '<span class="lvl" style="margin-top:8px"><i style="width:' + Math.round(fl.indexOf(o.status) / (fl.length - 1) * 100) + '%"></i></span>' +
          (c === 'QC' ? '<div class="kb-foot"><small>Video QC</small><strong>' + (o.qcSent ? 'Terkirim' : 'Belum') + '</strong></div>' : '') + (c === 'Packing' && !isLunas(o) ? '<small style="color:var(--orange-deep)">Menunggu pelunasan</small>' : '') + '</a>'; }).join('') + '</div>'; }).join('') + '</div>' +
    '<p class="small faint" style="margin-top:10px">Klik kartu untuk memajukan status. Mesin tanpa gerobak mulai dari QC.</p>';
}

/* --- Servis --- */
function timServis() {
  const tk = S.tickets.slice().sort((a, b) => (a.status === 'Selesai') - (b.status === 'Selesai') || (a.id < b.id ? 1 : -1));
  const doneT = S.tickets.filter(t => t.status === 'Selesai' && t.when);
  return title('Servis dan garansi', 'Tiket masuk lewat scan QR di mesin', '<a class="btn" href="#/pelanggan">Contoh QR mesin</a>') +
    '<div class="kpis"><div class="kpi warn"><small>Menunggu teknisi</small><b>' + S.tickets.filter(t => t.status === 'Menunggu teknisi' || t.status === 'Baru').length + '</b></div>' +
    '<div class="kpi"><small>Dijadwalkan</small><b>' + S.tickets.filter(t => t.status === 'Dijadwalkan').length + '</b></div>' +
    '<div class="kpi"><small>Rata-rata selesai</small><b>' + (doneT.length ? (sum(doneT, t => Math.max(0, diff(t.created, t.when))) / doneT.length).toLocaleString('id-ID', { maximumFractionDigits: 1 }) : '—') + ' hari</b></div>' +
    '<div class="kpi"><small>Mesin bergaransi aktif</small><b>' + S.units.filter(warrantyOn).length + ' unit</b><em>dari ' + S.units.length + ' terdaftar</em></div></div>' +
    '<div class="panel"><table class="tbl cards"><thead><tr><th>Tiket</th><th>Pelanggan</th><th>Mesin</th><th>Keluhan</th><th>Garansi</th><th>Status</th></tr></thead><tbody>' +
    tk.map(t => { const u = U(t.serial); return '<tr class="click" data-act="ticket" data-id="' + t.id + '">' + td('Tiket', '<b>' + t.id + '</b><small>' + fds(t.created) + '</small>') + td('Pelanggan', esc(custLine(u.cust))) + td('Mesin', esc(P(u.p).name) + '<small>' + u.serial + '</small>') +
      td('Keluhan', esc(t.issue)) + td('Garansi', warrantyOn(u) ? 'Aktif s/d ' + monthYear(warrantyEnd(u)) : 'Habis') + td('Status', st(t.status + (t.when && t.status === 'Dijadwalkan' ? ' ' + fds(t.when) : ''), t.status === 'Selesai' ? 'ok' : t.status === 'Dijadwalkan' ? '' : 'warn')) + '</tr>'; }).join('') + '</tbody></table></div>';
}
function ticketModal(t) {
  const u = U(t.serial), c = C(u.cust);
  modal('Tiket ' + t.id + ': ' + esc(t.issue),
    '<dl class="spec" style="margin-top:0"><dt>Pelanggan</dt><dd>' + esc(custLine(c.id)) + ' · ' + esc(c.phone) + '</dd><dt>Mesin</dt><dd>' + esc(P(u.p).name) + ' (' + u.serial + ')</dd><dt>Dibeli</dt><dd>' + fd(u.sold) + '</dd>' +
    '<dt>Garansi</dt><dd>' + (warrantyOn(u) ? 'Aktif sampai ' + fd(warrantyEnd(u)) + ', gratis' : 'Habis ' + fd(warrantyEnd(u)) + ', berbayar') + '</dd><dt>Masuk</dt><dd>' + fd(t.created) + ' lewat scan QR</dd>' + (t.note ? '<dt>Keterangan</dt><dd>' + esc(t.note) + '</dd>' : '') + '</dl>' +
    (t.status === 'Selesai' ? '<div class="notice ok">Selesai ' + fd(t.when) + ' oleh ' + esc(t.tech) + '.</div>' :
      '<form data-form="schedule"><input type="hidden" name="id" value="' + t.id + '"><div class="grid g2" style="gap:0 12px">' +
      '<label class="field">Teknisi<select name="tech">' + TECHS.map(x => '<option' + (x === t.tech ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></label>' +
      '<label class="field">Cara<select name="how">' + ['Video call', 'Kunjungan ke lokasi', 'Mesin dibawa ke toko'].map(x => '<option' + (x === t.how ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></label></div>' +
      '<label class="field">Tanggal<input type="date" name="when" value="' + (t.when || addDays(TODAY, 1)) + '" min="' + TODAY + '"></label>' +
      '<div class="btn-row"><button class="btn dark" type="submit">Simpan jadwal</button><button class="btn pri" type="button" data-act="ticket-done" data-id="' + t.id + '">Tandai selesai</button><a class="btn" href="#/qr/' + u.serial + '" data-act="close-go">Halaman QR</a></div></form>'));
}

/* --- Keuangan --- */
function timKeuangan() {
  const pays = []; S.orders.forEach(o => o.pays.forEach(p => pays.push({ o: o, p: p })));
  const nov = pays.filter(x => x.p.date >= '2026-11-01');
  const open = S.orders.filter(o => left(o) > 0).sort((a, b) => a.due < b.due ? -1 : 1);
  const due = open.filter(o => diff(TODAY, o.due) <= 0);
  return title('Keuangan', 'November 2026 · faktur, DP, pelunasan, dan piutang', '<button class="btn" type="button" data-act="export">Ekspor ke Excel</button>') +
    '<div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="kpi"><small>Kas masuk November</small><b>' + rpS(sum(nov, x => x.p.amt)) + '</b><em class="up">dari ' + nov.length + ' pembayaran</em></div>' +
    '<div class="kpi"><small>Piutang berjalan</small><b>' + rpS(sum(open, left)) + '</b><em>' + open.length + ' faktur</em></div>' +
    '<div class="kpi' + (due.length ? ' warn' : '') + '"><small>Jatuh tempo hari ini</small><b>' + rpS(sum(due, left)) + '</b><em>' + due.length + ' faktur</em></div></div>' +
    '<div class="panel" style="margin-bottom:16px"><h2>Faktur belum lunas</h2><table class="tbl cards"><thead><tr><th>Faktur</th><th>Pelanggan</th><th class="r">Tagihan</th><th class="r">Sisa</th><th>Jatuh tempo</th><th>Status</th><th></th></tr></thead><tbody>' +
    (open.map(o => '<tr>' + td('Faktur', '<b>' + invOf(o) + '</b><small><a href="#/tim/order/' + o.id + '">' + o.id + '</a></small>') + td('Pelanggan', esc(custLine(o.cust))) + td('Tagihan', rpS(orderTotal(o)), 'r') + td('Sisa', '<b>' + rpS(left(o)) + '</b>', 'r') +
      td('Jatuh tempo', diff(TODAY, o.due) === 0 ? 'Hari ini' : fd(o.due)) + td('Status', payPill(o)) + td('Aksi', '<span class="btn-row"><button class="btn sm dark" type="button" data-act="pay" data-id="' + o.id + '">Catat bayar</button><button class="btn sm" type="button" data-act="bill" data-id="' + o.id + '">Ingatkan</button></span>') + '</tr>').join('') || '<tr><td colspan="7" class="empty">Semua faktur lunas.</td></tr>') + '</tbody></table></div>' +
    '<div class="panel"><h2>Pembayaran masuk terbaru</h2><table class="tbl cards"><thead><tr><th>Tanggal</th><th>Order</th><th>Pelanggan</th><th>Jenis</th><th class="r">Jumlah</th></tr></thead><tbody>' +
    pays.sort((a, b) => a.p.date < b.p.date ? 1 : -1).slice(0, 8).map(x => '<tr>' + td('Tanggal', fd(x.p.date)) + td('Order', '<a href="#/tim/order/' + x.o.id + '">' + x.o.id + '</a>') + td('Pelanggan', esc(custName(x.o.cust))) + td('Jenis', esc(x.p.note)) + td('Jumlah', '<b>' + rp(x.p.amt) + '</b>', 'r') + '</tr>').join('') + '</tbody></table></div>';
}

/* --- Pelanggan dan pengingat --- */
function timPelanggan(sub) {
  if (sub && sub !== 'pengingat') return timPelangganDetail(sub);
  const tabs = '<div class="tabs"><a class="chip" href="#/tim/pelanggan" aria-pressed="' + !sub + '">Semua pelanggan</a><a class="chip" href="#/tim/pelanggan/pengingat" aria-pressed="' + (sub === 'pengingat') + '">Pengingat pesan ulang</a></div>';
  if (sub === 'pengingat') {
    const ms = S.customers.filter(c => c.mitra).map(c => ({ c: c, r: refill(c) })).filter(x => x.r).sort((a, b) => a.r.daysLeft - b.r.daysLeft);
    return title('Pelanggan', 'Pengingat dikirim hanya ke pelanggan yang setuju') + tabs +
      '<div class="panel"><table class="tbl cards"><thead><tr><th>Mitra</th><th>Pesanan bahan terakhir</th><th>Perkiraan habis</th><th>Kondisi</th><th>Setuju diingatkan</th><th></th></tr></thead><tbody>' +
      ms.map(x => '<tr>' + td('Mitra', '<a href="#/tim/pelanggan/' + x.c.id + '"><b>' + esc(x.c.name) + '</b></a><small>' + esc(x.c.city) + '</small>') + td('Terakhir', x.r.order.id + '<small>' + fd(x.r.order.date) + ' · ' + rpS(orderTotal(x.r.order)) + '</small>') +
        td('Perkiraan habis', fd(x.r.end) + '<small>' + (x.r.daysLeft >= 0 ? x.r.daysLeft + ' hari lagi' : 'lewat ' + -x.r.daysLeft + ' hari') + '</small>') +
        td('Kondisi', st(x.r.state, x.r.state === 'Aman' || x.r.state === 'Sudah pesan lagi' ? 'ok' : 'warn')) + td('Setuju', x.c.consent ? 'Ya' : 'Belum') +
        td('Aksi', x.c.reminded ? st('Terkirim ' + x.c.reminded, 'mute') : x.r.fresh ? '' : '<button class="btn sm' + (x.c.consent ? ' pri' : '') + '" type="button" data-act="remind" data-c="' + x.c.id + '"' + (x.c.consent ? '' : ' disabled title="Pelanggan belum setuju"') + '>Kirim pengingat</button>') + '</tr>').join('') +
      '</tbody></table><p class="small faint" style="margin-top:8px">Perkiraan habis = tanggal pesanan bahan terakhir + siklus pemakaian tiap mitra. Pengingat bisa otomatis terkirim 3 hari sebelum habis.</p></div>';
  }
  const rows = S.customers.map(c => { const os = S.orders.filter(o => o.cust === c.id); return { c: c, os: os, last: os.map(o => o.date).sort().pop(), tot: sum(os, orderTotal) }; }).sort((a, b) => (a.last || '') < (b.last || '') ? 1 : -1);
  return title('Pelanggan', S.customers.length + ' pelanggan · ' + S.customers.filter(c => c.mitra).length + ' mitra bahan') + tabs +
    '<div class="panel"><table class="tbl cards"><thead><tr><th>Pelanggan</th><th>Jenis</th><th>Order terakhir</th><th class="r">Total belanja</th><th>Mesin</th></tr></thead><tbody>' +
    rows.map(x => '<tr class="click" data-href="#/tim/pelanggan/' + x.c.id + '">' + td('Pelanggan', '<a href="#/tim/pelanggan/' + x.c.id + '"><b>' + esc(x.c.name) + '</b></a><small>' + esc(x.c.city) + '</small>') + td('Jenis', x.c.mitra ? st('Mitra bahan', 'ok') : st('Pembeli', 'mute')) +
      td('Terakhir', x.last ? fd(x.last) : '—') + td('Total', rpS(x.tot), 'r') + td('Mesin', S.units.filter(u => u.cust === x.c.id).length + ' unit') + '</tr>').join('') + '</tbody></table></div>';
}
function timPelangganDetail(cid) {
  const c = C(cid); if (!c) return '<p class="empty">Pelanggan tidak ditemukan.</p>';
  const os = S.orders.filter(o => o.cust === cid), us = S.units.filter(u => u.cust === cid), tk = S.tickets.filter(t => us.some(u => u.serial === t.serial));
  const ch = S.chats.find(x => x.cust === cid);
  return title(esc(c.name), esc(c.city) + ' · ' + esc(c.phone) + (c.mitra ? ' · mitra bahan' : ''), (c.mitra ? '<a class="btn" href="#/mitra/' + cid + '">Halaman mitra</a>' : '') + (ch ? '<a class="btn" href="#/tim/chat/' + ch.id + '">Buka chat</a>' : '') + '<a class="btn" href="#/tim/pelanggan">Semua pelanggan</a>') +
    '<div class="kpis"><div class="kpi"><small>Total belanja</small><b>' + rpS(sum(os, orderTotal)) + '</b><em>' + os.length + ' order</em></div><div class="kpi"><small>Belum dibayar</small><b>' + rpS(sum(os, left)) + '</b></div><div class="kpi"><small>Mesin terdaftar</small><b>' + us.length + '</b></div>' +
    '<div class="kpi"><small>Pengingat bahan</small><b>' + (c.mitra ? (c.consent ? 'Aktif' : 'Belum setuju') : '—') + '</b>' + (c.mitra ? '<em><button class="link small" type="button" data-act="consent" data-c="' + cid + '">' + (c.consent ? 'Matikan' : 'Catat persetujuan') + '</button></em>' : '') + '</div></div>' +
    '<div class="cols"><section class="panel"><h2>Riwayat order</h2><table class="tbl cards"><thead><tr><th>Order</th><th>Item</th><th class="r">Total</th><th>Status</th></tr></thead><tbody>' +
      os.map(o => '<tr class="click" data-href="#/tim/order/' + o.id + '">' + td('Order', '<a href="#/tim/order/' + o.id + '"><b>' + o.id + '</b></a><small>' + fd(o.date) + '</small>') + td('Item', esc(itemsText(o))) + td('Total', rpS(orderTotal(o)), 'r') + td('Status', statusPill(o.status)) + '</tr>').join('') + '</tbody></table></section>' +
    '<section class="panel"><h2>Mesin dan servis</h2>' + (us.map(u => '<p style="padding:6px 0;border-bottom:1px solid var(--line-soft)"><a href="#/qr/' + u.serial + '"><b>' + u.serial + '</b></a> · ' + esc(P(u.p).name) + '<br><span class="small faint">Garansi ' + (warrantyOn(u) ? 'aktif s/d ' + fd(warrantyEnd(u)) : 'habis') + '</span></p>').join('') || '<p class="empty">Belum ada mesin.</p>') +
      (tk.length ? '<h2 style="margin-top:14px">Tiket servis</h2>' + tk.map(t => '<p class="small">' + t.id + ' · ' + esc(t.issue) + ' · ' + t.status + '</p>').join('') : '') + '</section></div>';
}

/* --- Laporan --- */
function timLaporan() {
  done('report');
  const nov = novOrders(), total = sum(nov, orderTotal), byLine = salesByLine(nov);
  const srcs = {}; S.leads.forEach(l => { srcs[l.src] = (srcs[l.src] || 0) + 1; });
  const conv = S.leads.filter(l => l.stage === 'Jadi order').length;
  const top = {}; nov.forEach(o => o.items.forEach(it => { top[it[0]] = (top[it[0]] || 0) + P(it[0]).price * it[1]; }));
  const topList = Object.keys(top).sort((a, b) => top[b] - top[a]).slice(0, 3);
  const quiet = S.customers.filter(c => c.mitra && (r => r && r.state === 'Jarang pesan')(refill(c)));
  const prev = HISTORY[HISTORY.length - 1][1];
  return title('Laporan bulanan', 'Dikirim otomatis ke pemilik setiap awal bulan', '<button class="btn pri" type="button" data-act="print">Cetak atau simpan PDF</button>') +
    '<article class="report"><p class="kicker">PIP Machinery · laporan November 2026, sampai ' + fd(TODAY) + '</p><h1 class="h2">Ringkasan untuk pemilik</h1>' +
    '<h2>Penjualan</h2><p>Penjualan November sejauh ini <b>' + rp(total) + '</b> dari <b>' + nov.length + ' order</b>, rata-rata ' + rpS(total / Math.max(1, nov.length)) + ' per order. Oktober ditutup ' + rpS(prev) + ' (contoh).</p>' + bars(byLine, rpS) +
    '<h2>Produk terlaris</h2><p>' + topList.map((p, k) => (k + 1) + '. ' + esc(P(p).name) + ' (' + rpS(top[p]) + ')').join('<br>') + '</p>' +
    '<h2>Asal prospek</h2>' + bars(Object.keys(srcs).map(k => [k, srcs[k]]).sort((a, b) => b[1] - a[1])) +
    '<p style="margin-top:8px">' + S.leads.length + ' prospek tercatat, ' + conv + ' sudah jadi order. Pemilih Mesin menyumbang ' + (srcs['Pemilih Mesin'] || 0) + ' prospek dengan jawaban lengkap.</p>' +
    '<h2>Purna jual</h2><p>' + S.tickets.length + ' tiket servis, ' + S.tickets.filter(t => t.status === 'Selesai').length + ' selesai. ' + S.units.filter(warrantyOn).length + ' mesin masih bergaransi.</p>' +
    '<h2>Perlu perhatian</h2><p>' + (quiet.length ? 'Mitra mulai jarang pesan: ' + quiet.map(c => esc(c.name) + ', ' + esc(c.city)).join('; ') + '. ' : '') + lowItems().length + ' item stok di bawah minimum. Piutang berjalan ' + rpS(sum(S.orders, left)) + '.</p>' +
    '<p class="small faint" style="margin-top:20px">Semua angka di laporan ini contoh, dihitung dari data demo.</p></article>';
}

/* ================= Klik dan form ================= */
const ACT = {
  close: () => closeModal(),
  'close-go': () => closeModal(),
  'tour-hide': () => { S.tour.hide = true; save(); renderTour(); },
  reset: () => { if (!confirm('Kembalikan semua data demo ke awal?')) return; try { localStorage.removeItem(KEY); } catch (e) { /* abaikan */ } S = seed(); location.hash = '#/'; render(); toast('Data demo dikembalikan ke awal.'); },
  menu: el => { const a = el.closest('.erp-side'); a.classList.toggle('open'); el.setAttribute('aria-expanded', String(a.classList.contains('open'))); },
  print: () => window.print(),
  export: () => toast('Di sistem asli, tombol ini mengunduh file Excel berisi faktur dan pembayaran.'),
  video: el => modal(esc(el.dataset.title), '<div class="video"><span class="play"></span><span class="cap">Contoh tempat video. Video asli direkam tim PIP.</span></div>', true),
  ask: el => {
    const p = el.dataset.p ? P(el.dataset.p) : null;
    modal('Chat admin PIP Machinery', '<form data-form="ask"><input type="hidden" name="p" value="' + (p ? p.id : '') + '"><input type="hidden" name="src" value="' + esc(el.dataset.src || 'Website') + '">' +
      '<div class="grid g2" style="gap:0 12px"><label class="field">Nama<input name="name" required autocomplete="name"></label><label class="field">Kota<input name="city" required></label></div>' +
      '<label class="field">Pesan<textarea name="text">' + (p ? 'Halo, saya tertarik dengan ' + esc(p.name) + '. Mohon info harga terbaru dan ketersediaannya.' : 'Halo PIP Machinery, saya mau tanya.') + '</textarea></label>' +
      '<button class="btn pri block" type="submit">Kirim lewat WhatsApp</button><p class="small muted" style="margin-top:8px">Di demo ini pesan masuk ke Pusat Chat tim.</p></form>');
  },
  try: el => {
    const p = P(el.dataset.p), days = [1, 3, 4, 5].map(n => addDays(TODAY, n));
    modal('Jadwalkan coba mesin', '<p class="muted" style="margin-bottom:12px">' + esc(p.name) + '. Coba langsung di toko Bantul atau lewat video call.</p><form data-form="try"><input type="hidden" name="p" value="' + p.id + '">' +
      '<div class="grid g2" style="gap:0 12px"><label class="field">Nama<input name="name" required value="' + esc(S.pm.name) + '"></label><label class="field">Kota<input name="city" required value="' + esc(S.pm.city) + '"></label>' +
      '<label class="field">Tanggal<select name="date">' + days.map(d => '<option value="' + d + '">' + fdl(d).replace(' 2026', '') + '</option>').join('') + '</select></label>' +
      '<label class="field">Jam<select name="time"><option>10.00</option><option>13.00</option><option>15.00</option></select></label></div>' +
      '<label class="field">Cara<select name="how"><option>Datang ke toko Bantul</option><option>Video call</option></select></label>' +
      '<button class="btn pri block" type="submit">Kirim jadwal</button></form>');
  },
  'pm-opt': el => { const q = QUESTIONS[S.pm.step]; S.pm.answers[q.key] = q.options[+el.dataset.n].v; S.pm.step++; while (S.pm.step < QUESTIONS.length && S.pm.answers[QUESTIONS[S.pm.step].key] !== undefined) S.pm.step++; save(); render(); window.scrollTo(0, 0); },
  'pm-back': () => { S.pm.step--; save(); render(); },
  'pm-goto': el => { S.pm.step = +el.dataset.i; save(); render(); },
  'pm-restart': () => { S.pm = { step: 0, answers: {}, name: S.pm.name, city: S.pm.city }; save(); render(); },
  'pm-send': el => {
    const m = P(el.dataset.p);
    if (!S.pm.name.trim() || !S.pm.city.trim()) { toast('Isi nama dan kota dulu, supaya admin tahu siapa yang bertanya.'); ($('#pm-name').value ? $('#pm-city') : $('#pm-name')).focus(); return; }
    const lead = createInquiry({ name: S.pm.name.trim(), city: S.pm.city.trim(), p: m.id, src: 'Pemilih Mesin', text: pmMessage(m), answers: [0, 1, 2, 3].map(ansLabel) });
    S.tour.lead = lead.id; done('lead'); save(); render();
    toast('Terkirim. Prospek baru masuk ke Pusat Chat tim.', '#/tim/chat/' + lead.chat, 'Lihat di layar admin');
  },
  cart: el => { const cart = S.carts[el.dataset.c], it = cart[+el.dataset.k]; it[1] = Math.max(0, it[1] + +el.dataset.d); S.carts[el.dataset.c] = cart.filter(x => x[1] > 0); save(); render(); },
  'cart-add': el => { S.carts[el.dataset.c].push([el.dataset.p, 1]); save(); render(); },
  reorder: el => {
    const c = C(el.dataset.c), items = S.carts[c.id].filter(it => it[1] > 0); if (!items.length) return;
    const o = createOrder(c, items.map(it => [it[0], it[1]]), 'Halaman mitra');
    const ch = chatFor(c.id);
    pushMsg(ch, 'in', 'Pesan ulang dari halaman mitra: ' + itemsText(o) + '. Total ' + rp(orderTotal(o)) + '.', true);
    pushMsg(ch, 'out', 'Terima kasih, order ' + o.id + ' sudah dibuat. Tagihan ' + rp(orderTotal(o)) + '. Setelah transfer, bahan dikemas hari itu juga.');
    delete S.carts[c.id]; c.reminded = null; done('reorder'); save(); render();
    toast('Order ' + o.id + ' masuk ke menu Penjualan.', '#/tim/order/' + o.id, 'Lihat di sisi tim');
  },
  'cust-chat': el => {
    modal('Chat admin', '<form data-form="cust-chat"><input type="hidden" name="c" value="' + el.dataset.c + '"><label class="field">Pesan<textarea name="text">Halo admin, saya mau tanya soal ' + esc(el.dataset.ctx) + '.</textarea></label><button class="btn pri block" type="submit">Kirim</button></form>');
  },
  lead: el => leadModal(L(el.dataset.id)),
  stage: el => { const l = L(el.dataset.id); l.stage = el.dataset.s; logIt('Prospek ' + l.name + ' pindah ke tahap ' + l.stage); save(); render(); leadModal(l); },
  'lead-order': el => {
    const l = L(el.dataset.id);
    modal('Buat order untuk ' + esc(l.name), orderForm({ lead: l.id, name: l.name, city: l.city, items: [[l.p, 1]].concat(l.extra ? [[l.extra, 1]] : []) }), true);
  },
  'new-order': () => modal('Order baru', orderForm({}), true),
  'new-lead': () => modal('Prospek baru', '<form data-form="new-lead"><div class="grid g2" style="gap:0 12px"><label class="field">Nama<input name="name" required></label><label class="field">Kota<input name="city" required></label></div>' +
    '<label class="field">Minat<select name="p">' + S.products.filter(p => ['mesin', 'paket', 'gerobak'].indexOf(p.cat) >= 0).map(p => '<option value="' + p.id + '">' + esc(p.name) + '</option>').join('') + '</select></label>' +
    '<label class="field">Asal<select name="src"><option>Instagram</option><option>Shopee</option><option>Telepon</option><option>Datang ke toko</option><option>Pameran</option></select></label><button class="btn pri block" type="submit">Simpan</button></form>'),
  'to-lead': el => { const ch = CH(el.dataset.id), id = nextNum(S.leads, 'L-'); S.leads.unshift({ id: id, name: ch.name, city: ch.city, p: 'soft-meja', src: ch.channel, stage: 'Dihubungi', follow: TODAY, created: TODAY, chat: ch.id }); ch.lead = id; ch.label = 'Prospek'; save(); render(); toast('Masuk ke Prospek, tahap Dihubungi.'); },
  quick: el => { $('#msg-in').value = el.dataset.text; $('#msg-in').focus(); },
  advance: el => {
    const o = O(el.dataset.id), c = canAdvance(o);
    if (c.next === 'Dikirim') {
      modal('Kirim ' + o.id, '<form data-form="ship"><input type="hidden" name="id" value="' + o.id + '"><label class="field">Kurir<select name="kurir"><option>JNE</option><option>JNT Cargo</option><option>SiCepat</option><option>Kurir toko</option></select></label>' +
        '<label class="field">Nomor resi<input name="resi" required value="' + (8800 + Math.floor(Math.random() * 99)) + ' ' + (1000 + Math.floor(Math.random() * 8999)) + ' ' + (10 + Math.floor(Math.random() * 89)) + '"><small>Resi cukup dimasukkan sekali. Pelanggan langsung dapat kabar di WhatsApp.</small></label>' +
        '<button class="btn pri block" type="submit">Simpan dan kirim kabar</button></form>');
      return;
    }
    advance(o); save(); render(); toast(o.id + ' masuk tahap ' + o.status + '.');
  },
  qc: el => { const o = O(el.dataset.id); o.qcSent = true; pushMsg(chatFor(o.cust), 'out', 'Video QC pesanan ' + o.id + ' sudah bisa dilihat di halaman lacak: pipmachinery.id/lacak/' + o.id); logIt('Video QC ' + o.id + ' dikirim ke pelanggan'); save(); render(); toast('Video QC terkirim ke pelanggan.'); },
  'send-track': el => { const o = O(el.dataset.id), ch = chatFor(o.cust); pushMsg(ch, 'out', 'Status pesanan ' + o.id + ': ' + o.status + '. Lacak di: pipmachinery.id/lacak/' + o.id); save(); toast('Link lacak terkirim ke chat ' + esc(custName(o.cust)) + '.', '#/tim/chat/' + ch.id, 'Buka chat'); },
  pay: el => {
    const o = O(el.dataset.id), half = Math.round(orderTotal(o) / 2);
    modal('Catat pembayaran ' + o.id, '<p class="muted" style="margin-bottom:12px">' + esc(custLine(o.cust)) + ' · total ' + rp(orderTotal(o)) + ' · sisa <b>' + rp(left(o)) + '</b></p><form data-form="pay"><input type="hidden" name="id" value="' + o.id + '">' +
      '<label class="field">Jenis<select name="kind">' + (paidOf(o) === 0 && o.kind !== 'bahan' && half < left(o) ? '<option value="dp">DP 50% · ' + rp(half) + '</option>' : '') + '<option value="lunas">Pelunasan · ' + rp(left(o)) + '</option><option value="lain">Nominal lain</option></select></label>' +
      '<label class="field">Nominal lain (Rp)<input type="number" name="amt" min="1" max="' + left(o) + '" placeholder="Isi bila memilih nominal lain"></label>' +
      '<label class="field">Bukti transfer<input type="text" name="ref" value="BCA, transfer ' + fds(TODAY) + '"></label><button class="btn pri block" type="submit">Simpan pembayaran</button></form>');
  },
  bill: el => { const o = O(el.dataset.id), ch = chatFor(o.cust); pushMsg(ch, 'out', 'Pengingat tagihan ' + invOf(o) + ' untuk ' + o.id + ': sisa ' + rp(left(o)) + ', jatuh tempo ' + fd(o.due) + '. Terima kasih.'); save(); toast('Pengingat tagihan terkirim.', '#/tim/chat/' + ch.id, 'Buka chat'); },
  'stock-in': () => modal('Stok masuk', '<form data-form="stock-in"><label class="field">Item<select name="p">' + S.products.filter(p => p.stock != null).map(p => '<option value="' + p.id + '">' + esc(p.name) + ' (sekarang ' + p.stock + ' ' + p.unit + ')</option>').join('') + '</select></label><label class="field">Jumlah masuk<input type="number" name="q" min="1" value="10" required></label><button class="btn pri block" type="submit">Simpan</button></form>'),
  po: () => {
    const low = lowItems();
    modal('Pesanan ke pemasok', low.length ? '<p class="muted" style="margin-bottom:10px">Jumlah disarankan supaya stok kembali dua kali batas minimum.</p><table class="tbl"><tbody>' + low.map(p => '<tr><td>' + esc(p.name) + '<small>stok ' + p.stock + ', min. ' + p.min + '</small></td><td class="r"><b>' + (p.min * 2 - p.stock) + '</b> ' + p.unit + '</td></tr>').join('') + '</tbody></table>' +
      '<button class="btn pri block" style="margin-top:14px" type="button" data-act="po-done">Tandai sudah dipesan dan stok datang</button><p class="small faint" style="margin-top:6px">Di demo, stok langsung ditambahkan supaya hasilnya terlihat.</p>' : '<p>Semua stok di atas minimum.</p>');
  },
  'po-done': () => { lowItems().forEach(p => { p.stock = p.min * 2; }); logIt('Stok dari pemasok masuk untuk item di bawah minimum'); closeModal(); save(); render(); toast('Stok diperbarui.'); },
  ticket: el => ticketModal(S.tickets.find(t => t.id === el.dataset.id)),
  'ticket-done': el => {
    const t = S.tickets.find(x => x.id === el.dataset.id), f = $('[data-form="schedule"]');
    t.tech = f.elements.tech.value; t.how = f.elements.how.value; t.status = 'Selesai'; t.when = TODAY;
    const u = U(t.serial); pushMsg(chatFor(u.cust), 'out', 'Tiket ' + t.id + ' (' + t.issue + ') sudah ditangani ' + t.tech + '. Kalau kendala muncul lagi, scan QR di mesin.');
    logIt('Tiket ' + t.id + ' selesai oleh ' + t.tech); done('fix'); closeModal(); save(); render(); toast('Tiket ' + t.id + ' selesai. Pelanggan dapat kabar di WhatsApp.');
  },
  remind: el => {
    const c = C(el.dataset.c), r = refill(c), ch = chatFor(c.id);
    pushMsg(ch, 'out', 'Halo ' + c.name + ', bahan dari pesanan ' + r.order.id + ' diperkirakan ' + (r.daysLeft >= 0 ? 'habis ' + r.daysLeft + ' hari lagi' : 'sudah habis') + '. Mau pesan seperti terakhir? Pesan sekali tekan: pipmachinery.id/mitra');
    c.reminded = fds(TODAY); logIt('Pengingat pesan ulang dikirim ke ' + c.name); save(); render();
    toast('Pengingat terkirim ke ' + esc(c.name) + '.', '#/mitra/' + c.id, 'Lihat halaman mitranya');
  },
  consent: el => { const c = C(el.dataset.c); c.consent = !c.consent; save(); render(); }
};

const FORM = {
  ask: d => {
    let chatId;
    if (d.p) chatId = createInquiry({ name: d.name, city: d.city, p: d.p, src: d.src, text: d.text }).chat;
    else { const ch = newChat(d.name, d.city, 'Baru'); ch.msgs.push(['in', d.text, now()]); chatId = ch.id; logIt('Chat baru dari website: ' + d.name + ', ' + d.city); }
    closeModal(); save(); render(); toast('Pesan terkirim ke admin.', '#/tim/chat/' + chatId, 'Lihat di layar admin');
  },
  try: d => {
    const p = P(d.p), note = (d.how === 'Video call' ? 'Video call ' : 'Coba mesin di Bantul ') + fdl(d.date).replace(' 2026', '') + ', ' + d.time;
    const l = createInquiry({ name: d.name, city: d.city, p: p.id, src: 'Jadwal coba mesin', stage: 'Coba mesin', note: note, text: 'Halo, saya mau jadwalkan coba ' + p.name + '.\n' + note + '\nNama: ' + d.name + '\nKota: ' + d.city });
    l.follow = d.date; closeModal(); save(); render(); toast('Jadwal terkirim. Masuk ke Prospek tahap Coba mesin.', '#/tim/prospek', 'Lihat di sisi tim');
  },
  gerobak: (d, f) => {
    const note = 'Gerobak ' + d.size + ', jual ' + d.jual + (d.color ? ', warna ' + d.color : '') + (d.brand ? ', tulisan "' + d.brand + '"' : '') + (d.mesin ? ', plus ' + P(d.mesin).name : '');
    const l = createInquiry({ name: d.name, city: d.city, p: 'gerobak', src: 'Form gerobak', note: note, text: 'Halo, saya isi form gerobak custom.\n' + note + '\nNama: ' + d.name + '\nKota: ' + d.city });
    if (d.mesin) l.extra = d.mesin;
    f.reset(); save(); render(); toast('Form terkirim ke admin.', '#/tim/chat/' + l.chat, 'Lihat di layar admin');
  },
  lacak: d => { location.hash = '#/lacak/' + d.id.trim().toUpperCase(); },
  'cust-chat': d => { const ch = chatFor(d.c); pushMsg(ch, 'in', d.text, true); closeModal(); save(); toast('Pesan masuk ke Pusat Chat tim.', '#/tim/chat/' + ch.id, 'Lihat di layar admin'); },
  send: d => {
    const ch = CH(d.id); if (!d.text.trim()) return;
    pushMsg(ch, 'out', d.text.trim()); ch.admin = ADMINS.indexOf(S.user) >= 0 ? S.user : ch.admin;
    if (ch.lead) { const l = L(ch.lead); if (l.stage === 'Baru') l.stage = 'Dihubungi'; done('reply'); }
    save(); render();
    if (ch.lead && !ch.auto && L(ch.lead).stage !== 'Jadi order') {
      ch.auto = true;
      setTimeout(() => {
        const here = route()[1] === 'chat';
        pushMsg(ch, 'in', 'Oke, saya ambil yang itu. Bisa langsung dibuatkan order? DP-nya berapa?', route()[2] !== ch.id);
        save(); if (here) render(); else renderTour();
      }, 1600);
    }
  },
  follow: d => { const l = L(d.id); l.follow = d.date; save(); render(); leadModal(l); toast('Pengingat follow up disimpan: ' + fd(d.date) + '.'); },
  order: d => {
    const items = [0, 1, 2].map(k => [d['p' + k], Math.max(1, +d['q' + k] || 1)]).filter(it => it[0]);
    if (!items.length) { toast('Pilih minimal satu item.'); return; }
    const c = findOrMakeCustomer(d.name.trim(), d.city.trim()), l = d.lead ? L(d.lead) : null;
    const o = createOrder(c, items, l ? 'Prospek ' + l.src : 'Input admin');
    if (l) {
      l.stage = 'Jadi order'; l.order = o.id;
      const ch = CH(l.chat); if (ch) { ch.cust = c.id; ch.label = 'Pelanggan'; pushMsg(ch, 'out', 'Order ' + o.id + ' sudah dibuat: ' + itemsText(o) + '. Total ' + rp(orderTotal(o)) + (o.kind === 'bahan' ? '.' : ', DP 50% ' + rp(Math.round(orderTotal(o) / 2)) + '.') + ' Status bisa dilacak di pipmachinery.id/lacak/' + o.id); }
      if (l.id === S.tour.lead || !S.tour.order) { S.tour.order = o.id; }
      done('order');
    }
    closeModal(); save(); location.hash = '#/tim/order/' + o.id; toast('Order ' + o.id + ' dibuat. Faktur ' + invOf(o) + ' masuk ke Keuangan.');
  },
  'new-lead': d => { const id = nextNum(S.leads, 'L-'); S.leads.unshift({ id: id, name: d.name, city: d.city, p: d.p, src: d.src, stage: 'Baru', follow: TODAY, created: TODAY }); logIt('Prospek ' + d.name + ' dicatat manual'); closeModal(); save(); render(); },
  pay: d => {
    const o = O(d.id), amt = d.kind === 'dp' ? Math.round(orderTotal(o) / 2) : d.kind === 'lunas' ? left(o) : +d.amt;
    if (!(amt > 0)) { toast('Isi nominalnya dulu.'); return; }
    addPayment(o, amt, (d.kind === 'dp' ? 'DP 50%' : d.kind === 'lunas' ? 'Pelunasan' : 'Pembayaran') + (d.ref ? ' · ' + d.ref : ''));
    pushMsg(chatFor(o.cust), 'out', 'Pembayaran ' + rp(Math.min(amt, orderTotal(o))) + ' untuk ' + o.id + ' sudah kami terima. ' + (isLunas(o) ? 'Tagihan lunas.' : 'Sisa ' + rp(left(o)) + '.') + ' Terima kasih.');
    closeModal(); save(); render(); toast('Pembayaran tercatat. ' + (isLunas(o) ? 'Order lunas.' : 'Sisa ' + rp(left(o)) + '.'));
  },
  ship: d => { const o = O(d.id); advance(o, d.kurir + ' ' + d.resi); closeModal(); save(); render(); toast(o.id + ' dikirim. Resi terkirim ke pelanggan.', '#/lacak/' + o.id, 'Lihat halaman lacak'); },
  'stock-in': d => { const p = S.products.find(x => x.id === d.p); p.stock += Math.max(1, +d.q); logIt('Stok masuk: ' + d.q + ' ' + p.unit + ' ' + p.name); closeModal(); save(); render(); toast('Stok ' + p.name + ' sekarang ' + p.stock + ' ' + p.unit + '.'); },
  ticket: (d, f) => {
    const u = U(d.serial), id = nextNum(S.tickets, 'T-');
    S.tickets.push({ id: id, serial: u.serial, issue: d.issue, note: d.note, status: 'Menunggu teknisi', created: TODAY });
    const ch = chatFor(u.cust); ch.label = 'Servis';
    pushMsg(ch, 'in', 'Lapor kendala lewat QR mesin ' + u.serial + ': ' + d.issue + (d.note ? '. ' + d.note : ''), true);
    pushMsg(ch, 'out', 'Tiket ' + id + ' sudah kami terima. ' + (warrantyOn(u) ? 'Mesin masih bergaransi, servis gratis.' : 'Garansi sudah habis, teknisi kabari biayanya dulu.') + ' Teknisi menghubungi paling lambat besok.');
    logIt('Tiket servis ' + id + ' masuk lewat scan QR: ' + d.issue); done('ticket'); f.reset(); save(); render();
    toast('Tiket ' + id + ' terkirim ke teknisi.', '#/tim/servis', 'Lihat menu Servis');
  },
  schedule: d => { const t = S.tickets.find(x => x.id === d.id); t.tech = d.tech; t.how = d.how; t.when = d.when; t.status = 'Dijadwalkan'; const u = U(t.serial);
    pushMsg(chatFor(u.cust), 'out', 'Tiket ' + t.id + ': ' + t.how.toLowerCase() + ' dengan ' + t.tech + ' pada ' + fdl(t.when).replace(' 2026', '') + '.');
    logIt('Tiket ' + t.id + ' dijadwalkan: ' + t.tech + ', ' + fd(t.when)); save(); render(); ticketModal(t); toast('Jadwal tersimpan dan pelanggan diberi kabar.'); }
};

document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a && ACT[a.dataset.act]) {
    if (a.tagName === 'A' && a.dataset.act !== 'close-go') e.preventDefault();
    ACT[a.dataset.act](a, e); return;
  }
  const row = e.target.closest('tr[data-href]');
  if (row && !e.target.closest('a, button')) { location.hash = row.dataset.href; return; }
  if (e.target.id === 'modal') closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); ACT[e.target.dataset.act](e.target); }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault();
  const d = {}; new FormData(f).forEach((v, k) => { d[k] = v; });
  if (FORM[f.dataset.form]) FORM[f.dataset.form](d, f);
});
document.addEventListener('input', e => {
  if (e.target.matches('[data-calc]')) updCalc();
  if (e.target.id === 'pm-name' || e.target.id === 'pm-city') { S.pm[e.target.id === 'pm-name' ? 'name' : 'city'] = e.target.value; save(); updBubble(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.actChange === 'user') { S.user = t.value; save(); render(); }
  if (t.dataset.actChange === 'assign') { CH(t.dataset.id).admin = t.value; save(); render(); toast('Chat dialihkan ke ' + t.value + '.'); }
});
window.addEventListener('hashchange', () => { closeModal(); render(); });

load();
render();
})();
