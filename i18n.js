// Dua bahasa (Indonesia / English). Teks asli situs dalam bahasa Indonesia;
// saat bahasa Inggris dipilih, teks di halaman diterjemahkan memakai kamus & pola di bawah.
(function () {
    var KEY = 'bahasa';
    function simpanan() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    // Bawaan: bahasa Indonesia, kecuali browser pengunjung bukan berbahasa Indonesia
    var lang = simpanan() || (/^(id|ms)/i.test(navigator.language || 'id') ? 'id' : 'en');
    document.documentElement.lang = lang;
    window.BAHASA = lang;

    // ---------- Kamus: teks persis ----------
    var EN = {
        // Menu & umum
        'Beranda': 'Home', 'Anggota': 'Members', 'Silsilah': 'Family Tree', 'Galeri': 'Gallery',
        'Tentang Kami': 'About Us', 'Motto': 'Motto', 'Keluarga Tri Waluyo': 'Tri Waluyo Family',
        'Batal': 'Cancel', 'Simpan': 'Save', 'Tutup': 'Close', 'Masuk': 'Sign in',
        '🔑 Masuk': '🔑 Sign in', '🔓 Keluar dari mode keluarga': '🔓 Sign out of family mode',
        '© 2026 Keluarga Tri Waluyo · Dibuat dengan': '© 2026 Tri Waluyo Family · Made with', 'di Jakarta': 'in Jakarta',
        'Rumah digital Keluarga Tri Waluyo — mengenal Ayah, Ibu, Sylda, dan Haidar.': 'The Tri Waluyo Family’s digital home — meet Dad, Mom, Sylda, and Haidar.',

        // Beranda
        '🏡 Rumah Digital Kami': '🏡 Our Digital Home', 'Selamat datang di': 'Welcome to the',
        'Tempat kami berbagi cerita, hobi, dan mimpi. Kenali kami satu per satu melalui menu di atas.': 'A place where we share our stories, hobbies, and dreams. Get to know each of us through the menu above.',
        'Kenali Kami →': 'Meet Us →',

        // Anggota
        'Anggota Keluarga': 'Family Members', 'Empat orang, empat cerita, satu rumah.': 'Four people, four stories, one home.',
        'Ayah': 'Father', 'Ibu': 'Mother', 'Anak Pertama': 'First Child', 'Anak Kedua': 'Second Child',
        'Kepala keluarga dan karyawan swasta yang percaya pada kerja keras.': 'Head of the family and a private-sector employee who believes in hard work.',
        'Ibu rumah tangga, pemilik usaha katering, dan juru masak andalan keluarga.': 'Homemaker, catering business owner, and the family’s go-to cook.',
        'Mahasiswi Teknik Informatika yang bercita-cita menjadi Software Engineer.': 'Informatics Engineering student who dreams of becoming a Software Engineer.',
        'Pelajar yang hobi menggambar dan bercita-cita menjadi desainer grafis.': 'Student who loves drawing and dreams of becoming a graphic designer.',
        'Lihat profil →': 'View profile →',

        // Tentang & Motto
        'Situs ini adalah ruang kecil kami di internet untuk mengenalkan diri dan menyimpan cerita keluarga.': 'This site is our little corner of the internet to introduce ourselves and keep our family stories.',
        'Kebersamaan': 'Togetherness', 'Makan bersama, bercerita, dan saling mendukung di setiap langkah.': 'Eating together, sharing stories, and supporting each other every step of the way.',
        'Kerja Keras': 'Hard Work', 'Kami percaya usaha yang sungguh-sungguh akan selalu membuahkan hasil.': 'We believe that sincere effort always pays off.',
        'Terus Belajar': 'Keep Learning', 'Dari dapur, kampus, hingga kanvas gambar, kami selalu ingin tumbuh.': 'From the kitchen to campus to the drawing canvas, we always want to grow.',
        'Kerja keras tidak akan mengkhianati hasil.': 'Hard work never betrays its results.',
        '“Kerja keras tidak akan mengkhianati hasil.”': '“Hard work never betrays its results.”',
        'Motto Keluarga Tri Waluyo': 'Tri Waluyo Family Motto',

        // Profil
        '← Kembali ke Anggota': '← Back to Members', 'Kenali anggota keluarga lainnya': 'Meet the other family members',
        '📷 Ganti foto': '📷 Change photo', '✏️ Ubah profil': '✏️ Edit profile',
        'Nama Lengkap': 'Full Name', 'Tempat / Tanggal Lahir': 'Place / Date of Birth', 'Status': 'Status',
        'Pekerjaan': 'Occupation', 'Pendidikan': 'Education', 'Cita-cita': 'Aspiration', 'Kegiatan': 'Activities',
        'Masakan Andalan': 'Signature Dish', 'Koleksi': 'Collection', 'Belum diisi': 'Not filled in yet',
        'Dikenal Sebagai': 'Known As', 'Hobi & Minat': 'Hobbies & Interests',
        'Kepala Keluarga': 'Head of the Family', 'Pekerja Keras': 'Hard Worker', 'Karyawan Swasta': 'Private-Sector Employee',
        'Ibu Rumah Tangga & Pemilik Usaha Katering': 'Homemaker & Catering Business Owner', 'Ibu Rumah Tangga': 'Homemaker', 'Wiraswasta': 'Entrepreneur',
        'Rendang daging dan kue bolu pandan': 'Beef rendang and pandan sponge cake', 'Tanaman hias anggrek': 'Ornamental orchids',
        'Memasak masakan Nusantara': 'Cooking Indonesian dishes', 'Merawat anggrek': 'Caring for orchids', 'Membuat kue': 'Baking',
        'Mahasiswi Teknik Informatika': 'Informatics Engineering student',
        'Menjadi Software Engineer di perusahaan teknologi dunia': 'Becoming a Software Engineer at a global tech company',
        'Game online': 'Online games', 'Coding website': 'Coding websites', 'Musik lo-fi': 'Lo-fi music',
        'Siswa MTsN 37 Jakarta Barat': 'Student at MTsN 37 West Jakarta', 'Aktif di klub seni sekolah': 'Active in the school art club',
        'Menjadi Desainer Grafis atau Animator': 'Becoming a Graphic Designer or Animator',
        'Ilustrasi digital': 'Digital illustration', 'Novel fiksi': 'Fiction novels', 'Koleksi stiker lucu': 'Collecting cute stickers',
        '“Masakan terenak adalah yang dimasak dengan cinta untuk keluarga.”': '“The tastiest food is the food cooked with love for the family.”',
        '“Satu baris kode hari ini, satu langkah menuju mimpi.”': '“One line of code today, one step closer to the dream.”',
        '“Setiap gambar dimulai dari satu goresan kecil.”': '“Every drawing starts with a single small stroke.”',
        'Ganti Foto Profil': 'Change Profile Photo', '📷 Pilih foto': '📷 Choose photo', '🔍 Perbesar': '🔍 Zoom',
        'Geser foto di dalam lingkaran untuk mengatur posisi wajah.': 'Drag the photo inside the circle to position the face.',
        'Ubah Profil': 'Edit Profile', 'Nama tampilan': 'Display name', 'Nama panggilan': 'Nickname',
        'Data diri': 'Personal details', '＋ Tambah baris': '＋ Add row', 'Judul kata kunci': 'Keywords heading',
        'Kata kunci': 'Keywords', 'Kutipan / motto': 'Quote / motto', 'Isi': 'Value', 'Ikon': 'Icon', 'Hapus baris': 'Remove row',
        'Judul, contoh: Hobi': 'Label, e.g. Hobby', 'untuk judul "Tentang …"': 'for the "About …" heading',
        'contoh: Dikenal Sebagai / Hobi & Minat': 'e.g. Known As / Hobbies & Interests',
        'Pisahkan dengan koma, contoh: Pekerja Keras, Suka Memasak': 'Separate with commas, e.g. Hard Worker, Loves Cooking',

        // Galeri
        'Galeri Liburan': 'Holiday Gallery',
        'Tempat-tempat yang pernah kami kunjungi bersama. Klik album untuk melihat semua fotonya.': 'Places we have visited together. Click an album to see all of its photos.',
        '＋ Tambah Foto': '＋ Add Photos', '📷 Belum ada foto.': '📷 No photos yet.', 'Klik': 'Click',
        'untuk menambahkan kenangan liburan pertama.': 'to add your first holiday memory.',
        'Tambah Foto Liburan': 'Add Holiday Photos', 'Simpan ke album': 'Save to album', '＋ Liburan baru': '＋ New trip',
        '📷 Klik untuk memilih foto': '📷 Click to choose photos', 'Bisa pilih banyak foto sekaligus': 'You can choose several photos at once',
        '＋ Tambah foto lagi': '＋ Add more photos', 'Sampul': 'Cover', 'Batalkan foto ini': 'Remove this photo',
        'Nama tempat': 'Place name', 'Kota': 'City', 'Waktu': 'Date', 'Cerita singkat': 'Short story',
        'contoh: Pantai Kuta': 'e.g. Kuta Beach', 'contoh: Bali': 'e.g. Bali', 'contoh: Juli 2024': 'e.g. July 2024',
        'Apa yang paling berkesan?': 'What was most memorable?', 'Simpan Foto': 'Save Photos',
        '🗑 Hapus foto ini': '🗑 Delete this photo', 'Hapus album': 'Delete album',
        'Foto sebelumnya': 'Previous photo', 'Foto berikutnya': 'Next photo',
        'Mengunggah foto…': 'Uploading photo…', 'Menyimpan album…': 'Saving album…', 'Menyimpan foto…': 'Saving photo…',
        'Pilih fotonya dulu.': 'Please choose a photo first.', 'Isi nama tempatnya dulu.': 'Please fill in the place name first.',
        'Galeri sedang diperbarui. Coba simpan lagi.': 'The gallery is being updated. Please try saving again.',
        'Format foto ini tidak bisa dibuka. Gunakan foto JPG atau PNG.': 'This photo format cannot be opened. Please use a JPG or PNG photo.',
        'Foto ini sudah terhapus sebelumnya. Muat ulang halaman.': 'This photo was already deleted. Please reload the page.',
        'Foto yang dihapus tidak bisa dikembalikan dari halaman ini.': 'Deleted photos cannot be restored from this page.',
        'Ini foto terakhir, jadi albumnya ikut terhapus.': 'This is the last photo, so the album will be deleted too.',
        '↔ Geser ke samping untuk melihat semua': '↔ Scroll sideways to see everything',

        // Silsilah
        'Silsilah Keluarga': 'Family Tree',
        'Garis keturunan keluarga besar kami. Klik nama untuk melihat foto dan keterangannya.': 'The lineage of our extended family. Click a name to see their photo and details.',
        '✏️ Kelola Silsilah': '✏️ Manage Family Tree', '✓ Selesai Mengelola': '✓ Done Managing',
        'Mode kelola aktif: klik seseorang untuk mengubah, menambah anak, pasangan, atau orang tua.': 'Manage mode is on: click someone to edit them or add a child, spouse, or parent.',
        'Memuat silsilah…': 'Loading family tree…', 'Silsilah masih kosong.': 'The family tree is still empty.',
        'Orang tua': 'Parents', 'Pasangan': 'Spouse', 'Anak': 'Children', 'Lihat halaman profil →': 'View profile page →',
        '✏️ Ubah / Foto': '✏️ Edit / Photo', '＋ Anak': '＋ Child', '＋ Pasangan': '＋ Spouse', '＋ Orang tua': '＋ Parent', '🗑 Hapus': '🗑 Delete',
        'Tambah Anggota': 'Add Member', 'Ubah Data': 'Edit Details', 'Tambah Anak': 'Add Child', 'Tambah Pasangan': 'Add Spouse', 'Tambah Orang Tua': 'Add Parent',
        'Pilih foto (opsional)': 'Choose photo (optional)', 'Ganti foto': 'Change photo', 'Nama lengkap': 'Full name',
        'Jenis kelamin': 'Gender', 'Laki-laki': 'Male', 'Perempuan': 'Female',
        'Masih hidup': 'Living', 'Sudah meninggal': 'Deceased', 'Anak dari': 'Child of', 'Anak ke-': 'Child no.',
        'Pernikahan': 'Marriage', 'Menikah': 'Married', 'Cerai': 'Divorced', 'Pasangan baru': 'New spouse', 'ke-': 'no.',
        'Keterangan': 'Notes', 'contoh: Slamet Ranu Tirto': 'e.g. Slamet Ranu Tirto', 'contoh: Solo, 1950': 'e.g. Solo, 1950',
        'contoh: 1 untuk anak pertama': 'e.g. 1 for the first child',
        'Almarhum': 'Deceased', 'Almarhumah': 'Deceased', '🕊 Almarhum': '🕊 Deceased', '🕊 Almarhumah': '🕊 Deceased',
        'Isi namanya dulu.': 'Please fill in the name first.',
        'Silsilah sedang diperbarui. Coba simpan lagi.': 'The family tree is being updated. Please try saving again.',
        'Orang ini sudah dihapus dari perangkat lain. Muat ulang halaman.': 'This person was deleted from another device. Please reload the page.',
        'Simpan Kunci GitHub dulu lewat tombol ✏️ Ubah / Foto.': 'Please save the GitHub key first using the ✏️ Edit / Photo button.',
        'Kakek (dari Ayah)': 'Grandfather (father’s side)', 'Nenek (dari Ayah)': 'Grandmother (father’s side)',
        'Kakek (dari Ibu)': 'Grandfather (mother’s side)', 'Nenek (dari Ibu)': 'Grandmother (mother’s side)',

        // Kunci & mode keluarga
        '🔑 Kunci GitHub': '🔑 GitHub key', 'Kunci GitHub': 'GitHub key', '· tersimpan ✓': '· saved ✓', '· wajib diisi': '· required',
        'Hanya keluarga yang punya kunci ini yang bisa menambah foto. Kunci disimpan di perangkat ini saja.': 'Only family members with this key can add photos. The key is stored on this device only.',
        'Kunci yang sama dengan di Galeri. Disimpan di perangkat ini saja.': 'The same key as in the Gallery. Stored on this device only.',
        'Hapus kunci dari perangkat ini': 'Remove key from this device', 'Kunci dihapus dari perangkat ini.': 'The key was removed from this device.',
        'Masukkan Kunci GitHub dulu.': 'Please enter the GitHub key first.', 'Masuk Mode Keluarga': 'Sign in to Family Mode',
        'Masukkan Kunci GitHub untuk menampilkan tombol tambah & ubah.': 'Enter the GitHub key to show the add & edit buttons.',
        'Lakukan hanya di perangkat milik sendiri, dan pilih': 'Only do this on your own device, and choose',
        'Masukkan Kunci GitHub untuk menampilkan tombol tambah & ubah. Lakukan hanya di perangkat milik sendiri, dan pilih': 'Enter the GitHub key to show the add & edit buttons. Only do this on your own device, and choose',
        'Keluar': 'Sign out', 'bila memakai perangkat orang lain.': 'when using someone else’s device.',
        'Memeriksa kunci…': 'Checking key…', 'Kunci salah atau sudah kedaluwarsa.': 'The key is wrong or has expired.',
        'Kunci GitHub salah atau sudah kedaluwarsa.': 'The GitHub key is wrong or has expired.',
        'Kunci ini tidak punya izin mengubah situs.': 'This key does not have permission to change the site.',
        'Gagal memeriksa kunci. Periksa koneksi internet.': 'Could not check the key. Please check your internet connection.',
        'Gagal menyimpan. Periksa koneksi internet lalu coba lagi.': 'Could not save. Please check your internet connection and try again.',
        'Menyimpan…': 'Saving…', 'Foto sedang diperbarui. Coba simpan lagi.': 'The photo is being updated. Please try saving again.',
        'Profil sedang diperbarui. Coba simpan lagi.': 'The profile is being updated. Please try saving again.',
        'Isi nama tampilan dulu.': 'Please fill in the display name first.',
        'Pengunjung lain akan melihatnya dalam 1–2 menit, setelah GitHub selesai memperbarui situs.': 'Other visitors will see it in 1–2 minutes, once GitHub finishes updating the site.',
        'Foto profil tersimpan! 🎉': 'Profile photo saved! 🎉', 'Profil tersimpan! 🎉': 'Profile saved! 🎉', 'Silsilah tersimpan! 🎉': 'Family tree saved! 🎉',
        'Di perangkat lain, foto baru akan muncul dalam beberapa menit (paling lama sekitar 10 menit).': 'On other devices, the new photo will appear within a few minutes (at most about 10 minutes).',
        'Keluar dari mode keluarga di perangkat ini?': 'Sign out of family mode on this device?',
        'Kunci GitHub akan dihapus dari browser ini, dan tombol ubah/tambah tidak tampil lagi.': 'The GitHub key will be removed from this browser, and the edit/add buttons will no longer appear.',

        // Kelola anggota
        'Kenali keluarga besar kami, satu per satu.': 'Get to know our extended family, one by one.',
        'Keluarga Inti': 'Immediate Family', '✏️ Kelola Anggota': '✏️ Manage Members',
        'Mode kelola aktif: tambah, ubah, hapus, atau geser urutan anggota dan kelompok.': 'Manage mode is on: add, edit, delete, or reorder members and groups.',
        '＋ Anggota': '＋ Member', '✏️ Kelompok': '✏️ Group', 'Naikkan': 'Move up', 'Turunkan': 'Move down',
        'Geser ke kiri': 'Move left', 'Geser ke kanan': 'Move right', 'Ubah': 'Edit', 'Hapus': 'Delete',
        'Belum ada anggota di kelompok ini.': 'No members in this group yet.', '＋ Tambah Kelompok': '＋ Add Group',
        'Kelompok': 'Group', 'Ubah Kelompok': 'Edit Group', 'Tambah Kelompok': 'Add Group', 'Nama kelompok': 'Group name',
        'contoh: Keluarga Besar Siti Umiyati': 'e.g. The Siti Umiyati Family', 'contoh: Orang tua dan saudara kandung': 'e.g. Parents and siblings',
        'Ubah Anggota': 'Edit Member', 'Ambil dari silsilah': 'Take from family tree', 'Tautkan ke silsilah': 'Link to family tree',
        '🔗 Foto anggota ini sama dengan foto di Silsilah. Mengganti foto di sini juga mengganti foto di Silsilah.': '🔗 This member’s photo is the same as in the Family Tree. Changing it here also changes it in the Family Tree.', '— Pilih nama (opsional) —': '— Choose a name (optional) —',
        'Foto anggota ini diganti lewat tombol 📷 Ganti foto di halaman profilnya.': 'This member’s photo is changed with the 📷 Change photo button on their profile page.',
        'Hubungan / peran': 'Relationship / role', 'contoh: Bapak, Kakak, Adik': 'e.g. Father, Older sibling, Younger sibling',
        'Deskripsi singkat': 'Short description', 'contoh: Pensiunan guru yang gemar berkebun.': 'e.g. A retired teacher who loves gardening.',
        'Warna kartu': 'Card color', 'Biru': 'Blue', 'Oranye': 'Orange', 'Ungu': 'Purple', 'Hijau': 'Green', 'Merah muda': 'Pink', 'Emas': 'Gold', 'Toska': 'Teal', 'Data sedang diperbarui. Coba simpan lagi.': 'The data is being updated. Please try saving again.',
        'Kelompok ini masih berisi anggota. Hapus atau pindahkan anggotanya dulu.': 'This group still has members. Delete or move its members first.',
        'Bapak': 'Father', 'Kakak': 'Older sibling', 'Adik': 'Younger sibling', 'Kakek': 'Grandfather', 'Nenek': 'Grandmother',
        'Paman': 'Uncle', 'Bibi': 'Aunt', 'Sepupu': 'Cousin', 'Keponakan': 'Nephew / Niece', 'Suami': 'Husband', 'Istri': 'Wife',
        'Bapak Mertua': 'Father-in-law', 'Ibu Mertua': 'Mother-in-law', 'Kakak Ipar': 'Older sibling-in-law', 'Adik Ipar': 'Younger sibling-in-law',
        'Memuat…': 'Loading…', 'Profil': 'Profile', 'Anggota tidak ditemukan': 'Member not found',
        'Anggota ini mungkin sudah dihapus. Kembali ke halaman Anggota.': 'This member may have been deleted. Go back to the Members page.',
        'Foto, nama, dan hubungan diubah lewat ✏️ Kelola Anggota.': 'Photo, name, and relationship are changed via ✏️ Manage Members.',

        // Kelola galeri, Tentang Kami, Motto
        '✏️ Ubah keterangan': '✏️ Edit details', '⭐ Jadikan sampul': '⭐ Set as cover',
        'Geser foto ke kiri': 'Move photo left', 'Geser foto ke kanan': 'Move photo right',
        '＋ Tambah Foto / Video': '＋ Add Photos / Videos', 'Tambah Foto & Video Liburan': 'Add Holiday Photos & Videos',
        '📷 Klik untuk memilih foto atau video': '📷 Click to choose photos or videos', 'Bisa pilih banyak sekaligus': 'You can choose several at once',
        '＋ Tambah foto / video lagi': '＋ Add more photos / videos', '🗑 Hapus video ini': '🗑 Delete this video',
        '＋ Tambah link': '＋ Add link', 'Link YouTube': 'YouTube link',
        '🎬 Video: MP4 paling aman. Maksimal 90 MB per video, sebaiknya di bawah 50 MB agar cepat terunggah. Video panjang lebih baik diunggah ke YouTube, lalu tempel linknya di sini:': '🎬 Videos: MP4 works best. At most 90 MB per video, ideally under 50 MB so it uploads quickly. Long videos are better uploaded to YouTube; paste the link here:',
        'Link YouTube tidak dikenali. Contoh: https://youtu.be/abcdefghijk': 'YouTube link not recognised. Example: https://youtu.be/abcdefghijk',
        '⚠️ Ada video di atas 50 MB: unggahnya lama dan bisa gagal bila sinyal lemah.': '⚠️ Some videos are over 50 MB: uploading takes a while and may fail on a weak connection.',
        'Video gagal diunggah (terlalu besar atau koneksi terputus). Coba video di bawah 50 MB, atau unggah ke YouTube lalu tempel linknya.': 'The video failed to upload (too large or the connection dropped). Try a video under 50 MB, or upload it to YouTube and paste the link.',
        'Ubah Keterangan Album': 'Edit Album Details',
        'Album ini sudah dihapus dari perangkat lain. Muat ulang halaman.': 'This album was deleted from another device. Please reload the page.',
        '✏️ Kelola Halaman': '✏️ Manage Page',
        'Mode kelola aktif: ubah judul & pengantar, atau tambah, ubah, hapus, dan geser kartu nilai keluarga.': 'Manage mode is on: edit the heading & introduction, or add, edit, delete, and reorder the family value cards.',
        'Mode kelola aktif: ubah, tambah, hapus, atau geser urutan motto dan kutipan keluarga.': 'Manage mode is on: edit, add, delete, or reorder the family mottos and quotes.',
        '✏️ Ubah judul & pengantar': '✏️ Edit heading & introduction', 'Ubah Judul & Pengantar': 'Edit Heading & Introduction',
        'Judul': 'Heading', 'Pengantar': 'Introduction', '＋ Tambah Nilai': '＋ Add Value', '＋ Tambah Motto': '＋ Add Motto',
        'Tambah Nilai': 'Add Value', 'Ubah Nilai': 'Edit Value', 'Tambah Motto': 'Add Motto', 'Ubah Motto': 'Edit Motto',
        'Ikon (emoji)': 'Icon (emoji)', 'Penjelasan': 'Description', 'contoh: Kebersamaan': 'e.g. Togetherness',
        'Apa arti nilai ini bagi keluarga kita?': 'What does this value mean to our family?',
        'Motto / kutipan': 'Motto / quote', 'Sumber': 'Source',
        'contoh: Kerja keras tidak akan mengkhianati hasil.': 'e.g. Hard work never betrays its results.',
        'contoh: Motto Keluarga Tri Waluyo / Pesan Kakek': 'e.g. Tri Waluyo Family Motto / Grandpa’s advice',

        // Pengaturan situs
        '⚙️ Pengaturan Situs': '⚙️ Site Settings', 'Pengaturan Situs': 'Site Settings',
        'Berlaku untuk semua halaman. Perubahan langsung terlihat sebagai pratinjau; klik Simpan untuk menerapkannya bagi semua pengunjung.': 'Applies to every page. Changes show right away as a preview; click Save to apply them for all visitors.',
        'Tema': 'Theme', 'Otomatis (mengikuti perangkat)': 'Automatic (follows the device)', 'Terang': 'Light', 'Gelap': 'Dark',
        'Warna utama': 'Main color', 'Pakai warna bawaan': 'Use the default color', 'Latar belakang': 'Background',
        'Bawaan': 'Default', 'Warna': 'Color', 'Gambar': 'Image', 'Warna lain': 'Other color',
        '🖼 Pilih gambar latar': '🖼 Choose background image', '🖼 Ganti gambar latar': '🖼 Change background image',
        'Gambar dibuat samar agar tulisan tetap mudah dibaca.': 'The image is faded so text stays easy to read.',
        'Kembalikan ke bawaan': 'Reset to default', 'Pilih gambar latarnya dulu.': 'Please choose a background image first.',
        'Pilih warna latarnya dulu.': 'Please choose a background color first.',
        'Logo': 'Logo', 'Huruf': 'Letters', 'Huruf logo': 'Logo letters', '🖼 Pilih gambar logo': '🖼 Choose logo image',
        '🖼 Ganti gambar logo': '🖼 Change logo image', 'Nama di samping logo': 'Name next to the logo',
        'Gambar dipotong persegi dan juga dipakai sebagai ikon di tab browser.': 'The image is cropped square and also used as the browser tab icon.',
        'Pilih gambar logonya dulu.': 'Please choose a logo image first.', 'Pengaturan tersimpan! 🎉': 'Settings saved! 🎉',

        // Judul halaman
        'Profil Ayah — Tri Waluyo': 'Father’s Profile — Tri Waluyo', 'Profil Ibu — Siti Umiyati': 'Mother’s Profile — Siti Umiyati',
        'Profil Anak Pertama — Sylda Frizqia Qiftiyani Putri': 'First Child’s Profile — Sylda Frizqia Qiftiyani Putri',
        'Profil Anak Kedua — Haidar Fawaz Alhuzam Putra': 'Second Child’s Profile — Haidar Fawaz Alhuzam Putra'
    };

    // ---------- Pola: teks yang berisi nama / angka ----------
    var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var URUT = { pertama: 'First', kedua: 'Second', ketiga: 'Third', keempat: 'Fourth', kelima: 'Fifth', keenam: 'Sixth',
        ketujuh: 'Seventh', kedelapan: 'Eighth', kesembilan: 'Ninth', kesepuluh: 'Tenth' };
    function jamak(n, satu, banyak) { return n + ' ' + (+n === 1 ? satu : banyak); }
    var POLA = [
        [/^(.+) — Keluarga Tri Waluyo$/, function (m) { return (t(m[1]) || m[1]) + ' — Tri Waluyo Family'; }],
        [/^Profil (.+)$/, function (m) { return 'Profile: ' + m[1]; }],
        [/^Orang tua dan saudara kandung (.+?)(\.?)$/, function (m) { return 'Parents and siblings of ' + m[1] + m[2]; }],
        [/^Hapus "(.+)" dari halaman Anggota\?$/, function (m) { return 'Remove "' + m[1] + '" from the Members page?'; }],
        [/^Hapus kelompok "(.+)"\?$/, function (m) { return 'Delete the group "' + m[1] + '"?'; }],
        [/^Hapus "(.+)"\?$/, function (m) { return 'Delete "' + m[1] + '"?'; }],
        [/^Warna (utama|latar) (#[0-9a-f]+)$/i, function (m) { return (m[1] === 'utama' ? 'Main color ' : 'Background color ') + m[2]; }],
        [/^Warna (\w+)$/, function (m) { return 'Color ' + m[1]; }],
        [/^Anak (pertama|kedua|ketiga|keempat|kelima|keenam|ketujuh|kedelapan|kesembilan|kesepuluh)$/i, function (m) { return URUT[m[1].toLowerCase()] + ' Child'; }],
        [/^Anak ke-(\d+)$/, function (m) { return 'Child no. ' + m[1]; }],
        [/^Anak (pertama|kedua|ketiga|keempat|kelima) dari (.+)$/i, function (m) { return URUT[m[1].toLowerCase()] + ' child of ' + m[2]; }],
        [/^Anak dari (.+)$/, function (m) { return 'Child of ' + m[1]; }],
        [/^Istri dari (.+)$/, function (m) { return 'Wife of ' + m[1]; }],
        [/^Suami dari (.+)$/, function (m) { return 'Husband of ' + m[1]; }],
        [/^Menikah dengan (.+)$/, function (m) { return 'Married to ' + m[1]; }],
        [/^Pasangan dari (.+)$/, function (m) { return 'Spouse of ' + m[1]; }],
        [/^Ayah atau ibu dari (.+)$/, function (m) { return 'Parent of ' + m[1]; }],
        [/^Pernikahan dengan (.+)$/, function (m) { return 'Marriage to ' + m[1]; }],
        [/^Tentang (.+)$/, function (m) { return 'About ' + m[1]; }],
        [/^Keluarga Besar (.+)$/, function (m) { return 'The ' + m[1] + ' Family'; }],
        [/^(Istri|Suami) ke-(\d+)( · Cerai)?$/, function (m) { return (m[1] === 'Istri' ? 'Wife' : 'Husband') + ' #' + m[2] + (m[3] ? ' · Divorced' : ''); }],
        [/^\((istri|suami) ke-(\d+)(, cerai)?\)$/, function (m) { return '(' + (m[1] === 'istri' ? 'wife' : 'husband') + ' #' + m[2] + (m[3] ? ', divorced' : '') + ')'; }],
        [/^\(cerai\)$/, function () { return '(divorced)'; }],
        [/^(.+) \(saja\)$/, function (m) { return m[1] + ' (only)'; }],
        [/^(.+) · (Ayah|Ibu|Anak Pertama|Anak Kedua)$/, function (m) { return m[1] + ' · ' + t(m[2]); }],
        [/^Foto (.+)$/, function (m) { return 'Photo of ' + m[1]; }],
        [/^Liburan ke (.+)$/, function (m) { return 'Trip to ' + m[1]; }],
        [/^📷 (\d+) foto$/, function (m) { return '📷 ' + jamak(m[1], 'photo', 'photos'); }],
        [/^🎬 (\d+) video$/, function (m) { return '🎬 ' + jamak(m[1], 'video', 'videos'); }],
        [/^((?:📷|🎬) .+) tersimpan! 🎉$/, function (m) { var x = t(m[1]); return x == null ? null : x + ' saved! 🎉'; }],
        [/^Mengunggah video (\d+) dari (\d+) \((\d+) MB\)…( \d+%)?$/, function (m) { return 'Uploading video ' + m[1] + ' of ' + m[2] + ' (' + m[3] + ' MB)…' + (m[4] || ''); }],
        [/^Hapus video ini dari album "(.+)"\?$/, function (m) { return 'Delete this video from the album "' + m[1] + '"?'; }],
        [/^(\d+) file tidak bisa dibuka \(gunakan foto JPG\/PNG atau video MP4\)\.$/, function (m) { return jamak(m[1], 'file', 'files') + ' could not be opened (use JPG/PNG photos or MP4 videos).'; }],
        [/^\((\d+) dipilih\)$/, function (m) { return '(' + m[1] + ' selected)'; }],
        [/^Mengunggah foto (\d+) dari (\d+)…$/, function (m) { return 'Uploading photo ' + m[1] + ' of ' + m[2] + '…'; }],
        [/^Menyiapkan foto (\d+) dari (\d+)…$/, function (m) { return 'Preparing photo ' + m[1] + ' of ' + m[2] + '…'; }],
        [/^Maksimal (\d+) foto sekali simpan\. (\d+) foto tidak ikut\.$/, function (m) { return 'At most ' + m[1] + ' photos per save. ' + jamak(m[2], 'photo was', 'photos were') + ' left out.'; }],
        [/^(\d+) foto tidak bisa dibuka \(gunakan JPG atau PNG\)\.$/, function (m) { return jamak(m[1], 'photo', 'photos') + ' could not be opened (use JPG or PNG).'; }],
        [/^(\d+) foto tersimpan! 🎉$/, function (m) { return jamak(m[1], 'photo', 'photos') + ' saved! 🎉'; }],
        [/^Hapus album "(.+)" beserta (\d+) fotonya\?$/, function (m) { return 'Delete the album "' + m[1] + '" and its ' + jamak(m[2], 'photo', 'photos') + '?'; }],
        [/^Hapus foto ini dari album "(.+)"\?$/, function (m) { return 'Delete this photo from the album "' + m[1] + '"?'; }],
        [/^Hapus "(.+)" dari silsilah\?$/, function (m) { return 'Remove "' + m[1] + '" from the family tree?'; }],
        [/^Pasangannya \((.+)\) juga ikut dihapus\.$/, function (m) { return 'Their spouse (' + m[1] + ') will be removed too.'; }],
        [/^(\d+) anaknya tetap ada di silsilah\.$/, function (m) { return 'Their ' + jamak(m[1], 'child stays', 'children stay') + ' in the family tree.'; }],
        [/^Kunci tidak punya izin menulis ke repositori (.+)\.$/, function (m) { return 'The key does not have permission to write to the ' + m[1] + ' repository.'; }],
        [/^(\d{1,2}) (\S+) (\d{4})$/, function (m) { var i = BULAN.indexOf(m[2]); return i < 0 ? null : m[1] + ' ' + MONTH[i] + ' ' + m[3]; }]
    ];

    // Terjemahkan satu teks; null bila tidak dikenal
    function t(s) {
        if (EN.hasOwnProperty(s)) return EN[s];
        for (var i = 0; i < POLA.length; i++) {
            var m = s.match(POLA[i][0]);
            if (m) { var r = POLA[i][1](m); if (r != null) return r; }
        }
        // Gabungan "a · b · c": terjemahkan per bagian
        if (s.indexOf(' · ') > 0) {
            var ubah = false, bagian = s.split(' · ').map(function (b) { var x = t(b); if (x != null) { ubah = true; return x; } return b; });
            if (ubah) return bagian.join(' · ');
        }
        // Nama bulan di dalam teks (mis. "Jawa Tengah · Juli 2024")
        var bulan = s.replace(new RegExp('\\b(' + BULAN.join('|') + ')\\b(?= \\d{4})', 'g'), function (b) { return MONTH[BULAN.indexOf(b)]; });
        return bulan !== s ? bulan : null;
    }
    // Pertahankan spasi di depan/belakang dan awalan "📍 "
    function terjemah(teks) {
        var m = teks.match(/^(\s*)([\s\S]*?)(\s*)$/);
        if (!m[2]) return null;
        var x = t(m[2]);
        if (x == null && /^📍 /.test(m[2])) { x = t(m[2].slice(3)); if (x != null) x = '📍 ' + x; }
        return x == null ? null : m[1] + x + m[3];
    }
    // Teks asli (bahasa Indonesia) sebuah elemen, walau sudah diterjemahkan — dipakai saat membaca isi halaman untuk disimpan
    var asli = typeof WeakMap === 'function' ? new WeakMap() : null;
    window.teksAsli = function (el) {
        if (!el) return '';
        if (!asli || lang !== 'en') return el.textContent;
        var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), out = '';
        for (var n = w.nextNode(); n; n = w.nextNode()) out += asli.has(n) ? asli.get(n) : n.nodeValue;
        return out;
    };

    // ---------- Pilihan bahasa di menu ----------
    function pasangTombol() {
        var nav = document.querySelector('.nav .wrap');
        if (!nav || document.getElementById('pilih-bahasa')) return;
        nav.insertAdjacentHTML('beforeend',
            '<div class="pilih-bahasa" id="pilih-bahasa" role="group" aria-label="Bahasa / Language">' +
            '<button type="button" data-lang="id"' + (lang === 'id' ? ' class="on" aria-pressed="true"' : '') + '>ID</button>' +
            '<button type="button" data-lang="en"' + (lang === 'en' ? ' class="on" aria-pressed="true"' : '') + '>EN</button></div>');
        document.getElementById('pilih-bahasa').addEventListener('click', function (e) {
            var b = e.target.closest('[data-lang]');
            if (!b || b.getAttribute('data-lang') === lang) return;
            try { localStorage.setItem(KEY, b.getAttribute('data-lang')); } catch (er) {}
            location.reload();
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasangTombol); else pasangTombol();

    if (lang !== 'en') return;

    // ---------- Terjemahkan halaman (termasuk isi yang dibuat belakangan oleh skrip) ----------
    var LEWATI = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
    var ATRIBUT = ['placeholder', 'aria-label', 'title', 'alt'];
    function teksNode(n) {
        var p = n.parentNode;
        if (!p || LEWATI[p.nodeName]) return;
        var x = terjemah(n.nodeValue);
        if (x != null && x !== n.nodeValue) { if (asli && !asli.has(n)) asli.set(n, n.nodeValue); n.nodeValue = x; }
    }
    function elemen(el) {
        if (el.nodeName === 'SCRIPT' || el.nodeName === 'STYLE') return;
        ATRIBUT.forEach(function (a) {
            var v = el.getAttribute(a);
            if (v) { var x = terjemah(v); if (x != null && x !== v) el.setAttribute(a, x); }
        });
        if (el.nodeName === 'META' && el.getAttribute('name') === 'description') {
            var c = terjemah(el.getAttribute('content') || ''); if (c) el.setAttribute('content', c);
        }
    }
    function pohon(akar) {
        if (akar.nodeType === 3) return teksNode(akar);
        if (akar.nodeType !== 1) return;
        elemen(akar);
        if (LEWATI[akar.nodeName]) return;
        var w = document.createTreeWalker(akar, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        for (var n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) teksNode(n); else elemen(n); }
    }
    new MutationObserver(function (list) {
        list.forEach(function (m) {
            if (m.type === 'characterData') teksNode(m.target);
            else if (m.type === 'attributes') elemen(m.target);
            else Array.prototype.forEach.call(m.addedNodes, pohon);
        });
        var judul = terjemah(document.title); if (judul && judul !== document.title) document.title = judul;
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATRIBUT });
    if (document.body) pohon(document.body);
    var judul0 = terjemah(document.title); if (judul0) document.title = judul0;

    // Pesan pop-up (alert / confirm) diterjemahkan per baris
    function perBaris(s) { return String(s).split('\n').map(function (b) { return terjemah(b) || b; }).join('\n'); }
    var asliAlert = window.alert, asliConfirm = window.confirm;
    window.alert = function (m) { return asliAlert.call(window, perBaris(m)); };
    window.confirm = function (m) { return asliConfirm.call(window, perBaris(m)); };
})();
