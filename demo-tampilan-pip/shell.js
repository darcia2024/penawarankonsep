/* Hanya menyusun menu samping dan bilah atas yang sama di setiap layar tim.
   Tidak ada logika bisnis di demo ini. */
(function () {
  var I = {
    dasbor: '<path d="M3 3h6v8H3zM11 3h6v5h-6zM11 10h6v7h-6zM3 13h6v4H3z"/>',
    crm: '<circle cx="7" cy="7" r="3"/><path d="M2 17c0-3 2.5-5 5-5s5 2 5 5M13 6.5a2.6 2.6 0 1 1 0 5M14.5 12.5c2 .5 3.5 2.3 3.5 4.5"/>',
    chat: '<path d="M3 4h14v9H8l-4 3v-3H3z"/>',
    penjualan: '<path d="M3 4h2l2 9h9l2-6H6"/><circle cx="8" cy="16.5" r="1.3"/><circle cx="15" cy="16.5" r="1.3"/>',
    gudang: '<path d="M10 2 3 6v8l7 4 7-4V6zM3 6l7 4 7-4M10 10v8"/>',
    servis: '<path d="M14 3a4 4 0 0 0-5 5L3 14l3 3 6-6a4 4 0 0 0 5-5l-2.5 2.5-2-.5-.5-2z"/>',
    keuangan: '<rect x="2.5" y="5" width="15" height="11" rx="2"/><path d="M13 10.5h4.5M2.5 8h15"/>',
    web: '<circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.2 2.3 2.2 12.7 0 15M10 2.5c-2.2 2.3-2.2 12.7 0 15"/>',
    hp: '<rect x="5.5" y="2" width="9" height="16" rx="2"/><path d="M9 15h2"/>',
    search: '<circle cx="9" cy="9" r="5.5"/><path d="m13 13 4 4"/>',
    bell: '<path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 2h-13zM8.5 18a1.7 1.7 0 0 0 3 0"/>',
    member: '<rect x="2.5" y="4.5" width="15" height="11" rx="2"/><circle cx="7" cy="10" r="1.8"/><path d="M11 8.5h4M11 11.5h2.5"/>',
    help: '<circle cx="10" cy="10" r="7.5"/><path d="M8 8a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2v.5M10 14h.01"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + I[n] + '</g></svg>'; }
  window.ic = ic;
  var page = document.body.getAttribute('data-page');
  var nav = [
    ['Kerja harian'],
    ['dasbor', 'Dasbor', 'dashboard.html'],
    ['crm', 'CRM dan prospek', 'crm.html', '6'],
    ['member', 'Membership', 'membership.html'],
    ['chat', 'Pusat chat', 'chat.html', '4'],
    ['penjualan', 'Penjualan', 'penjualan.html', '2'],
    ['gudang', 'Stok dan produksi', 'gudang.html', '4'],
    ['servis', 'Servis', 'servis.html', '2'],
    ['keuangan', 'Keuangan', 'keuangan.html'],
    ['Untuk pembeli'],
    ['web', 'Landing page', 'landing.html'],
    ['hp', 'Layar pelanggan', 'pelanggan.html']
  ];
  var side = document.querySelector('[data-side]');
  if (side) side.innerHTML = '<a class="side-brand" href="index.html"><img src="assets/logo-pip-machinery-light.png" alt="PIP Machinery"><span><small>Sistem usaha</small></span></a>' +
    '<nav class="side-nav" aria-label="Menu sistem">' +
    nav.map(function (n) {
      if (n.length === 1) return '<p class="side-label">' + n[0] + '</p>';
      return '<a href="' + n[2] + '"' + (n[0] === page ? ' aria-current="page"' : '') + '>' + ic(n[0]) + '<span>' + n[1] + '</span>' + (n[3] ? '<em>' + n[3] + '</em>' : '') + '</a>';
    }).join('') + '</nav>' +
    '<div class="side-foot"><span class="av o">NS</span><span><b>Nisa</b><small>Admin · Toko Bantul</small></span></div>';
  /* Di HP menu jadi satu baris geser: posisikan menu halaman ini di awal baris */
  var cur = side && side.querySelector('.side-nav [aria-current="page"]');
  if (cur && cur.parentNode.scrollWidth > cur.parentNode.clientWidth) cur.parentNode.scrollLeft = cur.offsetLeft - 12;
  var top = document.querySelector('[data-top]');
  if (top) top.innerHTML = '<div class="search">' + ic('search') + '<span>Cari order, pelanggan, atau mesin</span><kbd>Ctrl K</kbd></div>' +
    '<div class="topbar-r"><span class="pill mute">Jumat, 6 Nov 2026</span><span class="icon-btn" aria-label="Bantuan">' + ic('help') + '</span><span class="icon-btn" aria-label="Notifikasi">' + ic('bell') + '<i></i></span><span class="av o">NS</span></div>';
  document.querySelectorAll('[data-ic]').forEach(function (el) { el.innerHTML = ic(el.getAttribute('data-ic')) + el.innerHTML; });
})();
