/* Data bersama untuk demo dan form testimoni Nasrudin Babas Hasan. Semua contoh. Data yang diisi saat mencoba hanya tersimpan di browser itu. */
(function () {
  // Travel tempat Bang Babas jadi muthowif. Nama travel di sini CONTOH, nanti diganti nama asli dari halaman admin.
  // rombongan = nama grup, berangkat/pulang = tanggal (format TAHUN-BULAN-TANGGAL), pulang boleh dikosongkan.
  // Keberangkatan asli dari folder dokumentasi Google Drive. Nama rombongan, tanggal pulang & jumlah jamaah bisa dilengkapi dari admin.
  const groups = [
    { id: 'naura-nov26', nama: 'Naura Abada', short: 'Naura Abada', bulan: 'Umrah Nov 2026', rombongan: '', berangkat: '2026-11-02', pulang: '', jamaah: 0, foto: '../assets/trip/naura-nov26-0.jpg', pos: '50% 22%', galeri: ['../assets/trip/naura-nov26-1.jpg', '../assets/trip/naura-nov26-2.jpg', '../assets/trip/naura-nov26-3.jpg'] },
    { id: 'tanur-okt26', nama: 'Tanur', short: 'Tanur Okt', bulan: 'Umrah Arbain', rombongan: '', berangkat: '2026-10-13', pulang: '', jamaah: 0, foto: '../assets/trip/tanur-okt26-0.jpg', pos: '50% 58%', galeri: ['../assets/trip/tanur-okt26-1.jpg', '../assets/trip/tanur-okt26-2.jpg', '../assets/trip/tanur-okt26-3.jpg'] },
    { id: 'aljasiah-sep26', nama: 'Aljasiah', short: 'Aljasiah', bulan: 'Umrah Sep 2026', rombongan: '', berangkat: '2026-09-26', pulang: '', jamaah: 0, foto: '../assets/trip/aljasiah-sep26-0.jpg', pos: '50% 55%', galeri: ['../assets/trip/aljasiah-sep26-1.jpg', '../assets/trip/aljasiah-sep26-2.jpg', '../assets/trip/aljasiah-sep26-3.jpg'] },
    { id: 'ismi-sep26', nama: 'Ismi Tour', short: 'Ismi Tour', bulan: 'Umrah Sep 2026', rombongan: '', berangkat: '2026-09-17', pulang: '2026-09-25', jamaah: 0, foto: '../assets/trip/ismi-sep26-0.jpg', pos: '50% 50%', galeri: ['../assets/trip/ismi-sep26-1.jpg', '../assets/trip/ismi-sep26-2.jpg', '../assets/trip/ismi-sep26-3.jpg'] },
    { id: 'tanur-agu26', nama: 'Tanur', short: 'Tanur Agu', bulan: 'Umrah Agu 2026', rombongan: '', berangkat: '2026-08-20', pulang: '', jamaah: 0, foto: '../assets/trip/tanur-agu26-0.jpg', pos: '50% 50%', galeri: ['../assets/trip/tanur-agu26-1.jpg', '../assets/trip/tanur-agu26-2.jpg', '../assets/trip/tanur-agu26-3.jpg'] },
    { id: 'tanur-jun26', nama: 'Tanur', short: 'Tanur Jun', bulan: 'Umrah Jun 2026', rombongan: '', berangkat: '2026-06-27', pulang: '', jamaah: 0, foto: '../assets/trip/tanur-jun26-0.jpg', pos: '50% 50%', galeri: ['../assets/trip/tanur-jun26-1.jpg', '../assets/trip/tanur-jun26-2.jpg', '../assets/trip/tanur-jun26-3.jpg'] }
  ];
  const grp = id => groups.find(x => x.id === id) || groups[0];
  const seed = [
    { id: 1, nama: 'Bu Hj. Siti', jk: 'w', kota: 'Bekasi', grup: 'tanur-okt26', bintang: 5, pesan: 'Bimbingannya sabar, manasik jadi tenang. Ibu-ibu rombongan dijaga betul waktu tawaf. Insya Allah mau berangkat lagi bareng.', st: 'shown', dur: '0:42', contoh: true },
    { id: 2, nama: 'Pak Rahmat & keluarga', jk: 'p', kota: 'Bandung', grup: 'tanur-jun26', bintang: 5, pesan: 'Ziarahnya penuh cerita sejarah, anak-anak sampai hafal kisah Uhud. Terima kasih banyak.', st: 'shown' },
    { id: 3, nama: 'Mbak Nisa', jk: 'w', kota: 'Jakarta', grup: 'ismi-sep26', bintang: 5, pesan: 'Pertama kali umrah, gak bingung sama sekali. Semua dijelasin pelan-pelan.', st: 'shown' },
    { id: 4, nama: 'Keluarga Fadli', jk: 'p', kota: 'Depok', grup: 'aljasiah-sep26', bintang: 5, pesan: 'Orang tua kami yang sudah sepuh merasa aman. Kursi roda disiapkan, jadwal disesuaikan.', st: 'shown' },
    { id: 5, nama: 'Pak Ujang', jk: 'p', kota: 'Garut', grup: 'tanur-agu26', bintang: 4, pesan: 'Doa-doanya dibimbing satu per satu, jadi khusyuk.', st: 'shown' },
    { id: 6, nama: 'Ibu Ratna', jk: 'w', kota: 'Bogor', grup: 'tanur-agu26', bintang: 5, pesan: 'Masya Allah, pengalaman yang tak terlupakan. Semoga Allah balas semua kebaikannya.', st: 'shown' },
    { id: 9, nama: 'Pak Darmawan', jk: 'p', kota: 'Cirebon', grup: 'tanur-okt26', bintang: 5, pesan: 'Arbain di Madinah jadi tenang karena jadwal sholatnya diatur rapi.', st: 'shown' },
    { id: 7, nama: 'Hendra', jk: 'p', kota: 'Tangerang', grup: 'naura-nov26', bintang: 5, pesan: 'Baru pulang minggu lalu, masih kebawa suasana Madinah. Makasih bimbingannya!', st: 'pending' },
    { id: 8, nama: 'aaaa', jk: 'p', kota: '-', grup: 'naura-nov26', bintang: 1, pesan: 'tes tes', st: 'pending' }
  ];
  // Penyimpanan demo: semua di browser yang dipakai mencoba (versi asli pakai server)
  const KEY = 'bhb-demo-5', GKEY = 'bhb-travel-2', SKEY = 'bhb-setelan-1';
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
