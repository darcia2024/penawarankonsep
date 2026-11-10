/* Data bersama untuk demo, form, dan admin testimoni Nasrudin Babas Hasan. Semua contoh.
   Data yang diisi saat mencoba hanya tersimpan di browser itu. */
(function () {
  // Travel tempat Bang Babas jadi muthowif. Nama travel di sini CONTOH, nanti diganti nama asli dari admin.
  // Tiap travel punya beberapa grup keberangkatan: nama grup, tanggal berangkat, jumlah jamaah.
  const groups = [
    { id: 'nov26', nama: 'Travel Safar Barokah', short: 'Safar Barokah', foto: '../assets/foto-tawaf-malam.jpg', pos: '52% 40%',
      berangkat: [{ id: 'sb-nov26', nama: 'Grup November', tgl: '2026-11-03', jamaah: 36 }] },
    { id: 'agu26', nama: 'Travel Nur Hijrah', short: 'Nur Hijrah', foto: '../assets/foto-kubah-hijau.jpg', pos: '40% 45%',
      berangkat: [{ id: 'nh-maulid', nama: 'Grup Maulid', tgl: '2026-09-01', jamaah: 30 }, { id: 'nh-agu26', nama: 'Grup Agustus A', tgl: '2026-08-05', jamaah: 42 }] },
    { id: 'feb26', nama: 'Travel Rihlah Iman', short: 'Rihlah Iman', foto: '../assets/foto-haram-ramadhan.jpg', pos: '58% 40%',
      berangkat: [{ id: 'ri-itikaf', nama: 'Grup Itikaf', tgl: '2026-03-08', jamaah: 25 }, { id: 'ri-ram1', nama: 'Grup Ramadhan 1', tgl: '2026-02-18', jamaah: 45 }] },
    { id: 'des25', nama: 'Travel Baitul Mulia', short: 'Baitul Mulia', foto: '../assets/foto-kabah-siang.jpg', pos: '52% 60%',
      berangkat: [{ id: 'bm-des25', nama: 'Grup Akhir Tahun', tgl: '2025-12-20', jamaah: 28 }] }
  ];
  const seed = [
    { id: 1, nama: 'Bu Hj. Siti', jk: 'w', kota: 'Bekasi', grup: 'feb26', brk: 'ri-ram1', bintang: 5, pesan: 'Bimbingannya sabar, manasik jadi tenang. Ibu-ibu rombongan dijaga betul waktu tawaf. Insya Allah mau berangkat lagi bareng.', st: 'shown', dur: '0:42', contoh: true },
    { id: 2, nama: 'Pak Rahmat & keluarga', jk: 'p', kota: 'Bandung', grup: 'des25', brk: 'bm-des25', bintang: 5, pesan: 'Ziarahnya penuh cerita sejarah, anak-anak sampai hafal kisah Uhud. Terima kasih banyak.', st: 'shown' },
    { id: 3, nama: 'Mbak Nisa', jk: 'w', kota: 'Jakarta', grup: 'feb26', brk: 'ri-ram1', bintang: 5, pesan: 'Pertama kali umrah, gak bingung sama sekali. Semua dijelasin pelan-pelan.', st: 'shown' },
    { id: 4, nama: 'Keluarga Fadli', jk: 'p', kota: 'Depok', grup: 'des25', brk: 'bm-des25', bintang: 5, pesan: 'Orang tua kami yang sudah sepuh merasa aman. Kursi roda disiapkan, jadwal disesuaikan.', st: 'shown' },
    { id: 5, nama: 'Pak Ujang', jk: 'p', kota: 'Garut', grup: 'agu26', brk: 'nh-maulid', bintang: 4, pesan: 'Doa-doanya dibimbing satu per satu, jadi khusyuk.', st: 'shown' },
    { id: 6, nama: 'Ibu Ratna', jk: 'w', kota: 'Bogor', grup: 'agu26', brk: 'nh-agu26', bintang: 5, pesan: 'Masya Allah, pengalaman yang tak terlupakan. Semoga Allah balas semua kebaikannya.', st: 'shown' },
    { id: 9, nama: 'Pak Darmawan', jk: 'p', kota: 'Cirebon', grup: 'feb26', brk: 'ri-itikaf', bintang: 5, pesan: 'Itikaf di sepuluh malam terakhir jadi tenang karena jadwalnya diatur rapi.', st: 'shown' },
    { id: 7, nama: 'Hendra', jk: 'p', kota: 'Tangerang', grup: 'nov26', brk: 'sb-nov26', bintang: 5, pesan: 'Baru pulang minggu lalu, masih kebawa suasana Madinah. Makasih bimbingannya!', st: 'pending' },
    { id: 8, nama: 'aaaa', jk: 'p', kota: '-', grup: 'nov26', brk: 'sb-nov26', bintang: 1, pesan: 'tes tes', st: 'pending' }
  ];

  // Penyimpanan demo: semua di browser yang dipakai mencoba (versi asli pakai server)
  const KEY = 'bhb-demo-5', GKEY = 'bhb-travel-2', SKEY = 'bhb-setelan-1';
  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const defaults = { wajibSetuju: true, suara: true, notifWa: '0812 0000 0000', ket: 'Muthowif umrah & haji' };
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const fmtTgl = s => { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); return d + ' ' + BULAN[m - 1] + ' ' + y; };
  const clone = o => JSON.parse(JSON.stringify(o));

  window.BHB = {
    groups: groups, seed: seed, KEY: KEY,
    loadGroups: () => read(GKEY, clone(groups)),
    saveGroups: g => write(GKEY, g),
    loadData: () => read(KEY, clone(seed)),
    saveData: d => write(KEY, d),
    loadSettings: () => Object.assign({}, defaults, read(SKEY, {})),
    saveSettings: s => write(SKEY, s),
    reset: () => { try { [KEY, GKEY, SKEY].forEach(k => localStorage.removeItem(k)); } catch (e) {} },
    fmtTgl: fmtTgl,
    // Grup keberangkatan, urut dari yang terbaru
    deps: g => (g && g.berangkat ? g.berangkat.slice().sort((a, b) => (b.tgl || '').localeCompare(a.tgl || '')) : []),
    findDep: (gs, brkId) => { for (const g of gs) for (const b of (g.berangkat || [])) if (b.id === brkId) return { g: g, b: b }; return null; },
    depLabel: b => b ? b.nama + (b.tgl ? ' · ' + fmtTgl(b.tgl) : '') : '',
    travelInfo: g => { const bs = (g && g.berangkat) || []; const n = bs.reduce((a, b) => a + (+b.jamaah || 0), 0); return bs.length + ' grup' + (n ? ' · ' + n + ' jamaah' : ''); }
  };
})();
