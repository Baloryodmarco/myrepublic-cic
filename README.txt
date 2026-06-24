MyRepublic CIC Starter Website v3 - Supabase Online Leads

Isi file:
- index.html: Landing page + form pengajuan customer
- dashboard.html: Dashboard leads lokal/demo
- styles.css: Styling website
- app.js: Fitur GPS, WhatsApp, pilih paket, dan kirim leads ke Supabase
- dashboard.js: Tabel leads lokal/demo, ubah status, export CSV

Update v3:
- Form pengajuan sekarang mengirim data ke tabel Supabase public.leads
- Data backup tetap disimpan di browser jika submit database gagal
- Dashboard publik masih bersifat demo lokal. Untuk data asli, cek dulu di Supabase Table Editor.

Paket sementara:
1. Striker - 225Mbps - Rp 250rb/bulan - Vidio Platinum, Fola Play
2. Nexus - 300Mbps - Promo Rp 300rb/bulan - Free Speed Boost 400Mbps

Cara update GitHub:
1. Upload/replace index.html dan app.js ke repository GitHub.
2. Tunggu GitHub Pages deploy ulang.
3. Buka website online, submit form testing.
4. Cek data di Supabase > Table Editor > leads.

Catatan keamanan:
- Supabase publishable/anon key boleh dipakai di frontend jika RLS policy sudah benar.
- Jangan pernah upload service_role key, database password, atau JWT secret ke GitHub.

Catatan:
Data leads sudah masuk ke Supabase. Untuk sementara, dashboard publik belum digunakan untuk data customer asli karena belum memiliki sistem login. Leads dicek melalui Supabase Table Editor.

Status:
- Website sudah online melalui GitHub Pages.
- Form customer sudah terhubung ke Supabase.
- Data leads sudah masuk ke tabel leads.
- Dashboard publik dinonaktifkan sementara demi keamanan data customer.