/* Data bersama untuk demo dan form testimoni Nasrudin Babas Hasan. Semua contoh. Data yang diisi saat mencoba hanya tersimpan di browser itu. */
(function () {
  // Travel tempat Bang Babas jadi muthowif. Nama travel di sini CONTOH, nanti diganti nama asli dari halaman admin.
  // rombongan = nama grup, berangkat/pulang = tanggal (format TAHUN-BULAN-TANGGAL), pulang boleh dikosongkan.
  const groups = [
    { id: 'nov26', nama: 'Travel Safar Barokah', bulan: 'Umrah Nov 2026', rombongan: 'Rombongan Al-Fatih', berangkat: '2026-11-02', pulang: '2026-11-11', short: 'Safar Barokah', jamaah: 36, foto: '../assets/foto-tawaf-malam.jpg', pos: '52% 40%' },
    { id: 'agu26', nama: 'Travel Nur Hijrah', bulan: 'Umrah Agu 2026', rombongan: 'Rombongan Ar-Rahman', berangkat: '2026-08-12', pulang: '2026-08-21', short: 'Nur Hijrah', jamaah: 42, foto: '../assets/foto-kubah-hijau.jpg', pos: '40% 45%' },
    { id: 'feb26', nama: 'Travel Rihlah Iman', bulan: 'Umrah Ramadhan 2026', rombongan: 'Rombongan Itikaf', berangkat: '2026-03-05', pulang: '2026-03-20', short: 'Rihlah Iman', jamaah: 45, foto: '../assets/foto-haram-ramadhan.jpg', pos: '58% 40%' },
    { id: 'des25', nama: 'Travel Baitul Mulia', bulan: 'Umrah Des 2025', rombongan: 'Rombongan Keluarga Sakinah', berangkat: '2025-12-20', pulang: '2025-12-29', short: 'Baitul Mulia', jamaah: 28, foto: '../assets/foto-kabah-siang.jpg', pos: '52% 60%' }
  ];
  const grp = id => groups.find(x => x.id === id) || groups[0];
  const seed = [
    { id: 1, nama: 'Bu Hj. Siti', jk: 'w', kota: 'Bekasi', grup: 'feb26', bintang: 5, pesan: 'Bimbingannya sabar, manasik jadi tenang. Ibu-ibu rombongan dijaga betul waktu tawaf. Insya Allah mau berangkat lagi bareng.', st: 'shown', dur: '0:42', contoh: true },
    { id: 2, nama: 'Pak Rahmat & keluarga', jk: 'p', kota: 'Bandung', grup: 'des25', bintang: 5, pesan: 'Ziarahnya penuh cerita sejarah, anak-anak sampai hafal kisah Uhud. Terima kasih banyak.', st: 'shown' },
    { id: 3, nama: 'Mbak Nisa', jk: 'w', kota: 'Jakarta', grup: 'feb26', bintang: 5, pesan: 'Pertama kali umrah, gak bingung sama sekali. Semua dijelasin pelan-pelan.', st: 'shown' },
    { id: 4, nama: 'Keluarga Fadli', jk: 'p', kota: 'Depok', grup: 'des25', bintang: 5, pesan: 'Orang tua kami yang sudah sepuh merasa aman. Kursi roda disiapkan, jadwal disesuaikan.', st: 'shown' },
    { id: 5, nama: 'Pak Ujang', jk: 'p', kota: 'Garut', grup: 'agu26', bintang: 4, pesan: 'Doa-doanya dibimbing satu per satu, jadi khusyuk.', st: 'shown' },
    { id: 6, nama: 'Ibu Ratna', jk: 'w', kota: 'Bogor', grup: 'agu26', bintang: 5, pesan: 'Masya Allah, pengalaman yang tak terlupakan. Semoga Allah balas semua kebaikannya.', st: 'shown' },
    { id: 9, nama: 'Pak Darmawan', jk: 'p', kota: 'Cirebon', grup: 'feb26', bintang: 5, pesan: 'Itikaf di sepuluh malam terakhir jadi tenang karena jadwalnya diatur rapi.', st: 'shown' },
    { id: 7, nama: 'Hendra', jk: 'p', kota: 'Tangerang', grup: 'nov26', bintang: 5, pesan: 'Baru pulang minggu lalu, masih kebawa suasana Madinah. Makasih bimbingannya!', st: 'pending' },
    { id: 8, nama: 'aaaa', jk: 'p', kota: '-', grup: 'nov26', bintang: 1, pesan: 'tes tes', st: 'pending' }
  ];
  // Penyimpanan demo: semua di browser yang dipakai mencoba (versi asli pakai server)
  const KEY = 'bhb-demo-4', GKEY = 'bhb-travel-1', SKEY = 'bhb-setelan-1';
  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  // Tanggal: '2026-11-02' + '2026-11-11' jadi '2–11 Nov 2026'
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const parse = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null; };
  const jadwal = g => {
    const a = parse(g && g.berangkat), b = parse(g && g.pulang);
    if (!a) return '';
    if (!b) return `${a.d} ${BLN[a.m]} ${a.y}`;
    if (a.y !== b.y) return `${a.d} ${BLN[a.m]} ${a.y} – ${b.d} ${BLN[b.m]} ${b.y}`;
    if (a.m !== b.m) return `${a.d} ${BLN[a.m]} – ${b.d} ${BLN[b.m]} ${b.y}`;
    return `${a.d}–${b.d} ${BLN[a.m]} ${a.y}`;
  };
  // Keterangan singkat: "Rombongan Al-Fatih · 2–11 Nov 2026" (kalau kosong pakai nama program)
  const info = g => [g && g.rombongan, jadwal(g) || (g && g.bulan)].filter(Boolean).join(' · ');
  // Data travel lama yang tersimpan di browser dilengkapi field baru dari contoh di atas
  const lengkapi = list => list.map(g => Object.assign({}, groups.find(x => x.id === g.id) || {}, g));
  const defaults = { wajibSetuju: true, suara: true, notifWa: '0812 0000 0000', ket: 'Muthowif umrah & haji' };
  window.BHB = {
    groups: groups, seed: seed, KEY: KEY,
    loadGroups: () => lengkapi(read(GKEY, groups)),
    jadwal: jadwal, info: info,
    saveGroups: g => write(GKEY, g),
    loadData: () => read(KEY, seed.map(t => Object.assign({}, t))),
    saveData: d => write(KEY, d),
    loadSettings: () => Object.assign({}, defaults, read(SKEY, {})),
    saveSettings: s => write(SKEY, s),
    reset: () => { try { [KEY, GKEY, SKEY].forEach(k => localStorage.removeItem(k)); } catch (e) {} }
  };
})();
