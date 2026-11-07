/* =====================================================================
   DATA CONTOH Demo Sistem PIP Machinery
   Semua nama, harga, stok, nomor order, dan tanggal di file ini hanya
   contoh untuk presentasi. Ganti dengan data asli PIP Machinery.
   Harga paket Joelly (Rp 10 juta) diambil dari website Purnama Eskrim.
   ===================================================================== */

var TODAY = '2026-11-06'; // "hari ini" di dalam demo (Jumat)
var LOGO = '../pitch-deck/assets/logo-pip-machinery.jpg';
var PEMILIH_LAMA = '../demo-pemilih-mesin/index.html';

var ADMINS = ['Nisa', 'Rudi'];
var TECHS = ['Pak Darto', 'Mas Iwan'];

/* cat: mesin | paket | gerobak | bahan | cone | topping | alat
   Untuk mesin dan paket: products, cap, capLabel, watt dipakai Pemilih Mesin. */
var PRODUCTS = [
  { id: 'soft-meja', cat: 'mesin', name: 'Mesin Soft Ice Cream Meja', price: 18000000, unit: 'unit', stock: 3, min: 2,
    products: ['soft'], cap: [1, 1], capLabel: '50–150 porsi/hari', watt: 1500, warranty: 12, cost: 2000,
    desc: 'Muat di booth kecil atau meja kasir. Pas untuk memulai soft ice cream tanpa toko besar.' },
  { id: 'soft-berdiri', cat: 'mesin', name: 'Mesin Soft Ice Cream Berdiri', price: 32000000, unit: 'unit', stock: 2, min: 1,
    products: ['soft'], cap: [2, 2], capLabel: 'di atas 150 porsi/hari', watt: 2500, warranty: 12, cost: 2000,
    desc: 'Untuk lokasi ramai yang melayani antrean panjang tanpa jeda.' },
  { id: 'hard-mixer', cat: 'mesin', name: 'Paket Hard Es Krim dengan Mixer', price: 4500000, unit: 'paket', stock: 4, min: 2,
    products: ['hard'], cap: [0, 0], capLabel: 'di bawah 50 porsi/hari', watt: 500, warranty: 6, cost: 2500,
    desc: 'Hard es krim bisa dibuat dengan mixer dan freezer, tanpa mesin khusus. Modal paling ringan.' },
  { id: 'wir-128y', cat: 'mesin', name: 'Mesin Hard Eskrim WIR-128Y', price: 14900000, unit: 'unit', stock: 1, min: 2,
    products: ['hard'], cap: [1, 2], capLabel: '50 porsi/hari ke atas', watt: 1200, warranty: 12, cost: 2500,
    desc: 'Proses simpel dengan hasil es krim yang stabil, untuk produksi harian yang lebih besar.' },
  { id: 'cup-sealer', cat: 'mesin', name: 'Cup Sealer Otomatis', price: 3500000, unit: 'unit', stock: 3, min: 1, warranty: 12,
    desc: 'Menutup cup minuman dan es krim dengan rapi, untuk jualan dibawa pulang.' },
  { id: 'joelly', cat: 'paket', name: 'Paket Usaha Joelly Es Krim', price: 10000000, unit: 'paket', stock: 4, min: 2, publik: true,
    products: ['gelato'], cap: [0, 1], capLabel: 'hingga 150 porsi/hari', watt: 500, cost: 2700,
    desc: 'Konsep tampilan gelato dengan modal minim: freezer 300 L, mixer, peralatan, bahan awal, dan waffle.' },
  { id: 'puter', cat: 'paket', name: 'Paket Es Puter Premium', price: 9000000, unit: 'paket', stock: 3, min: 1,
    products: ['puter'], cap: [0, 1], capLabel: 'hingga 150 porsi/hari', watt: 400, cost: 2500,
    desc: 'Es puter tradisional dengan konsep premium, bisa disesuaikan dengan kebutuhan usaha.' },
  { id: 'bingsoo', cat: 'paket', name: 'Paket Usaha Es Bingsoo', price: 15000000, unit: 'paket', stock: 2, min: 1,
    products: ['bingsoo'], cap: [0, 1], capLabel: 'hingga 150 porsi/hari', watt: 800, cost: 6000,
    desc: 'Mesin dan perlengkapan untuk mulai menjual dessert khas Korea.' },
  { id: 'potong', cat: 'paket', name: 'Paket PIP Es Potong', price: 8000000, unit: 'paket', stock: 3, min: 1,
    products: ['potong'], cap: [0, 1], capLabel: 'hingga 150 porsi/hari', watt: 500, cost: 1500,
    desc: 'Jajanan klasik yang disukai banyak kalangan, dilengkapi video tutorial pembuatan.' },
  { id: 'gerobak', cat: 'gerobak', name: 'Gerobak Custom 1,5 m', price: 3500000, unit: 'unit', custom: true,
    desc: 'Dibuat sesuai pesanan: ukuran, warna, dan branding nama usaha. Rata-rata 9 hari kerja.' },
  { id: 'bahan-coklat', cat: 'bahan', name: 'Bahan soft Joelly coklat', price: 120000, unit: 'kg', stock: 42, min: 30,
    desc: 'Cukup campur air. 1 kg untuk 3 liter adonan.' },
  { id: 'bahan-vanila', cat: 'bahan', name: 'Bahan soft Joelly vanila', price: 120000, unit: 'kg', stock: 18, min: 30,
    desc: 'Cukup campur air. 1 kg untuk 3 liter adonan.' },
  { id: 'bahan-stroberi', cat: 'bahan', name: 'Bahan soft Joelly stroberi', price: 120000, unit: 'kg', stock: 26, min: 20,
    desc: 'Varian baru bulan ini.', baru: true },
  { id: 'cone', cat: 'cone', name: 'Cone 4,5 cm', price: 120000, unit: 'pak 500 pcs', stock: 6, min: 4,
    desc: 'Produksi sendiri, renyah dan tidak mudah lembek.' },
  { id: 'waffle', cat: 'cone', name: 'Waffle kerucut standar', price: 85000, unit: 'pak 100 pcs', stock: 9, min: 10,
    desc: 'Produksi sendiri.' },
  { id: 'topping', cat: 'topping', name: 'Topping pasta coklat', price: 95000, unit: 'kg', stock: 12, min: 10,
    desc: 'Untuk lapisan dan saus.' },
  { id: 'kertas', cat: 'alat', name: 'Kertas pegangan waffle', price: 25000, unit: 'pak 100 lembar', stock: 4, min: 5,
    desc: 'Bisa dicetak dengan merek sendiri.' }
];

var CAT_LABEL = { mesin: 'Mesin', paket: 'Paket usaha', gerobak: 'Gerobak', bahan: 'Bahan', cone: 'Cone dan waffle', topping: 'Topping', alat: 'Perlengkapan' };

/* cycle = perkiraan hari sampai bahan habis, untuk pengingat pesan ulang */
var CUSTOMERS = [
  { id: 'c-lina', name: 'Bu Lina', city: 'Madiun', phone: '0812-3300-1187', mitra: true, consent: true, cycle: 28 },
  { id: 'c-maju', name: 'Toko Es Maju', city: 'Klaten', phone: '0813-2290-4410', mitra: true, consent: true, cycle: 21 },
  { id: 'c-kedai', name: 'Kedai Dingin', city: 'Kediri', phone: '0857-1022-3381', mitra: true, consent: true, cycle: 30 },
  { id: 'c-nur', name: 'Es Teler Mbak Nur', city: 'Klaten', phone: '0819-5521-0093', mitra: true, consent: true, cycle: 30 },
  { id: 'c-joko', name: 'Pak Joko', city: 'Sleman', phone: '0821-4410-7720', mitra: true, consent: false, cycle: 30 },
  { id: 'c-kios', name: 'Kios Dingin', city: 'Jakarta', phone: '0811-8830-2215' },
  { id: 'c-bayu', name: 'Bayu', city: 'Malang', phone: '0838-1120-6614' },
  { id: 'c-sari', name: 'Sari', city: 'Solo', phone: '0815-7781-2290' },
  { id: 'c-dewi', name: 'Dewi', city: 'Medan', phone: '0852-6610-3348' },
  { id: 'c-kopi', name: 'Kopi dan Es', city: 'Bandung', phone: '0822-1150-9934' },
  { id: 'c-dimas', name: 'Dimas', city: 'Bogor', phone: '0813-9902-1176' },
  { id: 'c-ayu', name: 'Rumah Es Ayu', city: 'Sleman', phone: '0896-3321-5508' },
  { id: 'c-tini', name: 'Warung Bu Tini', city: 'Bantul', phone: '0878-2210-6649' }
];

/* kind: mesin (mesin/paket tanpa produksi) | custom (ada gerobak, lewat Desain dan Produksi) | bahan
   log: riwayat status [status, tanggal] */
var ORDERS = [
  { id: 'PIP-2032', cust: 'c-joko', date: '2026-09-22', kind: 'bahan', items: [['bahan-coklat', 6], ['bahan-vanila', 4]], paid: 1200000, status: 'Selesai', resi: 'JNE 0119 2231 88' },
  { id: 'PIP-2041', cust: 'c-nur', date: '2026-09-29', kind: 'bahan', items: [['bahan-coklat', 6], ['bahan-stroberi', 6], ['waffle', 2]], paid: 1610000, status: 'Selesai', resi: 'JNT 8820 7712 01' },
  { id: 'PIP-2044', cust: 'c-lina', date: '2026-10-12', kind: 'bahan', items: [['bahan-coklat', 8], ['bahan-vanila', 7], ['cone', 1]], paid: 1920000, status: 'Selesai', resi: 'JNE 0119 4410 27' },
  { id: 'PIP-2046', cust: 'c-kedai', date: '2026-10-08', kind: 'bahan', items: [['bahan-coklat', 10]], paid: 1200000, status: 'Selesai', resi: 'SiCepat 0045 1182' },
  { id: 'PIP-2039', cust: 'c-maju', date: '2026-10-19', kind: 'bahan', items: [['bahan-coklat', 10], ['bahan-vanila', 8], ['cone', 2]], paid: 2400000, status: 'Selesai', resi: 'Kurir toko' },
  { id: 'PIP-2040', cust: 'c-kios', date: '2026-10-20', kind: 'custom', items: [['gerobak', 1], ['soft-meja', 1]], paid: 21500000, status: 'Dikirim', resi: 'JNT 8821 0441 7', qcSent: true,
    log: [['Menunggu bayar', '2026-10-20'], ['Desain', '2026-10-21'], ['Produksi', '2026-10-23'], ['QC', '2026-10-31'], ['Packing', '2026-11-02'], ['Dikirim', '2026-11-04']] },
  { id: 'PIP-2047', cust: 'c-bayu', date: '2026-10-27', kind: 'custom', items: [['gerobak', 1], ['soft-meja', 1]], paid: 10750000, status: 'Packing', qcSent: true,
    log: [['Menunggu bayar', '2026-10-27'], ['Desain', '2026-10-28'], ['Produksi', '2026-10-29'], ['QC', '2026-11-04'], ['Packing', '2026-11-06']] },
  { id: 'PIP-2048', cust: 'c-ayu', date: '2026-11-02', kind: 'mesin', items: [['joelly', 1]], paid: 10000000, status: 'Selesai', resi: 'Ambil di toko' },
  { id: 'PIP-2050', cust: 'c-tini', date: '2026-11-03', kind: 'mesin', items: [['potong', 1]], paid: 8000000, status: 'Dikirim', resi: 'Kurir toko' },
  { id: 'PIP-2051', cust: 'c-maju', date: '2026-11-04', kind: 'bahan', items: [['bahan-coklat', 10], ['bahan-vanila', 8], ['cone', 2]], paid: 2400000, status: 'Packing' },
  { id: 'PIP-2052', cust: 'c-sari', date: '2026-11-04', kind: 'mesin', items: [['wir-128y', 1]], paid: 14900000, status: 'QC' },
  { id: 'PIP-2053', cust: 'c-dewi', date: '2026-11-01', kind: 'custom', items: [['bingsoo', 1]], paid: 7500000, status: 'Produksi', note: 'Gerobak bingsoo warna mint, logo "Dewi Bingsoo"' },
  { id: 'PIP-2055', cust: 'c-kedai', date: '2026-11-05', kind: 'bahan', items: [['bahan-coklat', 10]], paid: 0, status: 'Menunggu bayar', due: '2026-11-06' },
  { id: 'PIP-2058', cust: 'c-kopi', date: '2026-11-05', kind: 'custom', items: [['gerobak', 1]], paid: 1750000, status: 'Desain', note: 'Gerobak 1,5 m, branding "Kopi dan Es"' }
];

/* Mesin terdaftar (dasar QR, garansi, dan servis) */
var UNITS = [
  { serial: 'SM-0187', p: 'soft-meja', cust: 'c-lina', sold: '2026-03-14' },
  { serial: 'SM-0152', p: 'soft-meja', cust: 'c-kedai', sold: '2026-01-20' },
  { serial: 'CS-0031', p: 'cup-sealer', cust: 'c-dimas', sold: '2026-06-05' },
  { serial: 'WR-0044', p: 'wir-128y', cust: 'c-maju', sold: '2025-08-10' },
  { serial: 'SM-0203', p: 'soft-meja', cust: 'c-kios', sold: '2026-11-04', order: 'PIP-2040' }
];

var TICKETS = [
  { id: 'T-117', serial: 'WR-0044', issue: 'Ganti dinamo', status: 'Selesai', tech: 'Pak Darto', created: '2026-10-28', when: '2026-10-30' },
  { id: 'T-118', serial: 'SM-0187', issue: 'Mesin berbunyi keras', status: 'Menunggu teknisi', created: '2026-11-04' },
  { id: 'T-119', serial: 'CS-0031', issue: 'Suhu tidak stabil', status: 'Dijadwalkan', tech: 'Mas Iwan', created: '2026-11-03', when: '2026-11-07', how: 'Video call' },
  { id: 'T-120', serial: 'SM-0152', issue: 'Hasil es terlalu cair', status: 'Menunggu teknisi', created: '2026-11-05' }
];

var STAGES = ['Baru', 'Dihubungi', 'Coba mesin', 'Negosiasi', 'Jadi order'];
var LEADS = [
  { id: 'L-31', name: 'Rina', city: 'Surabaya', p: 'soft-meja', src: 'Pemilih Mesin', stage: 'Baru', follow: '2026-11-06', chat: 'ch-rina', created: '2026-11-06',
    answers: ['Soft ice cream', '50–150 porsi', '1.300 VA', 'Rp 15–30 juta'] },
  { id: 'L-30', name: 'Agus', city: 'Semarang', p: 'joelly', src: 'Instagram', stage: 'Baru', follow: '2026-11-06', chat: 'ch-agus', created: '2026-11-05' },
  { id: 'L-28', name: 'Wulan', city: 'Medan', p: 'bingsoo', src: 'Website', stage: 'Dihubungi', follow: '2026-11-06', created: '2026-11-02' },
  { id: 'L-27', name: 'Yoga', city: 'Denpasar', p: 'gerobak', src: 'Instagram', stage: 'Dihubungi', follow: '2026-11-07', created: '2026-11-01' },
  { id: 'L-25', name: 'Hendra', city: 'Yogyakarta', p: 'soft-berdiri', src: 'Datang ke toko', stage: 'Coba mesin', follow: '2026-11-07', note: 'Coba mesin Sabtu 7 Nov, 10.00 di Bantul', created: '2026-10-30' },
  { id: 'L-22', name: 'Maya', city: 'Purwokerto', p: 'puter', src: 'Shopee', stage: 'Negosiasi', follow: '2026-11-09', note: 'Minta bonus bahan 5 kg', created: '2026-10-26' }
];

var CHATS = [
  { id: 'ch-rina', name: 'Rina', city: 'Surabaya', channel: 'WhatsApp', label: 'Prospek', admin: 'Nisa', unread: 1, lead: 'L-31', msgs: [
    ['in', 'Halo PIP Machinery, saya dari Pemilih Mesin di website.\n\nNama: Rina\nKota: Surabaya\nMau jual: Soft ice cream\nTarget: 50–150 porsi per hari\nListrik: 1.300 VA\nAnggaran: Rp 15–30 juta\nRekomendasi: Mesin Soft Ice Cream Meja\n\nMohon info harga terbaru dan ketersediaannya.', '08.12']] },
  { id: 'ch-agus', name: 'Agus', city: 'Semarang', channel: 'Instagram', label: 'Prospek', admin: 'Rudi', unread: 2, lead: 'L-30', msgs: [
    ['in', 'Kak, paket Joelly 10 juta itu sudah termasuk freezer?', '07.40'],
    ['in', 'Lokasi saya di dekat kampus, kira-kira cocok?', '07.41']] },
  { id: 'ch-kedai', name: 'Kedai Dingin', city: 'Kediri', channel: 'WhatsApp', label: 'Pelanggan', admin: 'Nisa', unread: 0, cust: 'c-kedai', msgs: [
    ['in', 'Pesan bahan coklat 10 kg seperti biasa ya.', 'Kemarin'],
    ['out', 'Siap, order PIP-2055 sudah dibuat. Tagihan Rp 1.200.000, jatuh tempo besok.', 'Kemarin']] },
  { id: 'ch-lina', name: 'Bu Lina', city: 'Madiun', channel: 'WhatsApp', label: 'Mitra', admin: 'Nisa', unread: 0, cust: 'c-lina', msgs: [
    ['in', 'Mesin saya bunyinya keras sejak kemarin. Sudah saya laporkan lewat QR.', '4 Nov'],
    ['out', 'Terima kasih Bu, tiket T-118 sudah masuk. Teknisi kami hubungi Ibu paling lambat Sabtu.', '4 Nov']] },
  { id: 'ch-hendra', name: 'Hendra', city: 'Yogyakarta', channel: 'WhatsApp', label: 'Prospek', admin: 'Rudi', unread: 0, lead: 'L-25', msgs: [
    ['in', 'Besok jadi coba mesin yang berdiri ya, jam 10.', 'Kemarin'],
    ['out', 'Siap Pak, kami tunggu di toko Bantul.', 'Kemarin']] }
];

/* Penjualan per bulan sebelum November (contoh), dalam rupiah */
var HISTORY = [['Jun', 96000000], ['Jul', 104000000], ['Agu', 99000000], ['Sep', 118000000], ['Okt', 125000000]];

/* Pertanyaan Pemilih Mesin, sama dengan demo-pemilih-mesin */
var QUESTIONS = [
  { key: 'product', sheet: 'Mau jual', title: 'Mau jual es krim jenis apa?',
    options: [
      { v: 'soft', label: 'Soft ice cream', hint: 'Lembut, keluar dari mesin ke cone' },
      { v: 'hard', label: 'Hard es krim', hint: 'Disimpan di freezer, disajikan dengan scoop' },
      { v: 'gelato', label: 'Semi gelato', hint: 'Tampilan gelato, modal lebih ringan' },
      { v: 'puter', label: 'Es puter', hint: 'Tradisional dengan konsep premium' },
      { v: 'bingsoo', label: 'Es bingsoo', hint: 'Dessert es serut khas Korea' },
      { v: 'potong', label: 'Es potong', hint: 'Jajanan klasik, mudah dijual' },
      { v: 'any', label: 'Belum yakin', hint: 'Pilihkan sesuai modal dan lokasi saya' }
    ] },
  { key: 'target', sheet: 'Target', title: 'Berapa porsi yang ingin dijual per hari?', help: 'Perkiraan saja. Ini untuk memastikan mesin tidak kekecilan saat ramai.',
    options: [
      { v: 0, label: 'Di bawah 50 porsi', hint: 'Mulai kecil atau tambahan menu' },
      { v: 1, label: '50–150 porsi', hint: 'Booth atau stand di lokasi ramai' },
      { v: 2, label: 'Di atas 150 porsi', hint: 'Toko, mal, atau area wisata' }
    ] },
  { key: 'power', sheet: 'Listrik', title: 'Berapa daya listrik di lokasi usaha?', help: 'Lihat di meteran PLN. Pilih yang paling mendekati.',
    options: [
      { v: 900, label: '900 VA', hint: 'Banyak dipakai di rumah' },
      { v: 1300, label: '1.300 VA', hint: '' },
      { v: 2200, label: '2.200 VA atau lebih', hint: 'Ruko atau toko' },
      { v: 0, label: 'Belum tahu', hint: 'Akan kami bantu cek' }
    ] },
  { key: 'budget', sheet: 'Anggaran', title: 'Berapa anggaran untuk mesin?', help: 'Belum termasuk sewa tempat. Jawaban ini hanya untuk menyaring pilihan.',
    options: [
      { v: 5, label: 'Di bawah Rp 5 juta', hint: '' },
      { v: 15, label: 'Rp 5–15 juta', hint: '' },
      { v: 30, label: 'Rp 15–30 juta', hint: '' },
      { v: 999, label: 'Di atas Rp 30 juta', hint: '' }
    ] }
];
var USABLE = { 900: 700, 1300: 1000, 2200: 1800 };

var NEEDS = {
  soft: ['Bahan soft es krim Joelly, lebih dari 15 rasa', 'Cone dan waffle produksi sendiri', 'Topping pasta dan oreo crumb'],
  hard: ['Bahan hard es krim Joelly, lebih dari 15 rasa', 'Cone, waffle, dan kertas pegangan', 'Topping pasta dan oreo crumb'],
  gelato: ['Bahan khusus mitra Joelly, varian diperbarui per tiga bulan', 'Waffle kerucut, waffle mangkok, dan cone', 'Kertas pegangan waffle, bisa dengan merek sendiri'],
  puter: ['Bahan es krim', 'Cone dan waffle', 'Topping'],
  bingsoo: ['Bahan dan topping bingsoo', 'Kemasan cup', 'Cup sealer bila dijual untuk dibawa pulang'],
  potong: ['Bahan es potong', 'Topping', 'Kemasan']
};

var TUTORIALS = {
  'soft-meja': ['Menyalakan dan mendinginkan mesin', 'Takaran adonan 1 kg : 3 liter', 'Membersihkan mesin setiap tutup toko', 'Kalau hasil es terlalu cair'],
  'soft-berdiri': ['Menyalakan dan mendinginkan mesin', 'Mengatur kekentalan', 'Membersihkan mesin setiap tutup toko'],
  'wir-128y': ['Menyalakan mesin', 'Takaran bahan hard', 'Membersihkan tabung'],
  'cup-sealer': ['Mengatur suhu', 'Mengganti rol plastik', 'Kalau segel tidak rapat']
};
