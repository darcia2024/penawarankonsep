/* Data bersama untuk demo dan form testimoni Nasrudin Babas Hasan. Semua contoh. Data yang diisi saat mencoba hanya tersimpan di browser itu. */
(function () {
  // Rombongan keberangkatan (di versi asli diatur dari halaman admin)
  const groups = [
    { id: 'nov26', nama: 'Rombongan November 2026', bulan: 'Nov 2026', jamaah: 36, foto: '../assets/foto-tawaf-malam.jpg', pos: '52% 40%' },
    { id: 'agu26', nama: 'Rombongan Agustus 2026', bulan: 'Agu 2026', jamaah: 42, foto: '../assets/foto-kubah-hijau.jpg', pos: '40% 45%' },
    { id: 'feb26', nama: 'Rombongan Ramadhan 2026', bulan: 'Feb 2026', jamaah: 45, foto: '../assets/foto-haram-ramadhan.jpg', pos: '58% 40%' },
    { id: 'des25', nama: 'Rombongan Akhir Tahun 2025', bulan: 'Des 2025', jamaah: 28, foto: '../assets/foto-kabah-siang.jpg', pos: '52% 60%' }
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
  window.BHB = { groups: groups, seed: seed, KEY: 'bhb-demo-4' };
})();
