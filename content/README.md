# Panduan Menulis Konten & Signals (`content/signals/`)

Folder ini adalah tempat Anda menulis **Essai**, **Hot-Take**, **Thesis**, **Catatan Teknis (Note)**, maupun **Observasi**.

Setiap file `.md` yang Anda tambahkan di folder `content/signals/` akan:
1. **Otomatis menjadi kartu tulisan di website** (`/signals` dan halaman depan `/`).
2. **Otomatis dibaca dan dipahami secara mendalam oleh Ciel** (termasuk seluruh paragraf esai Anda).

---

## Cara Membuat Tulisan Baru

1. Buat file baru di folder `content/signals/`, misalnya:  
   `2026-10-02-judul-tulisan-lu.md`

2. Isi bagian atas (*frontmatter*) dengan format sederhana:

```markdown
---
type: ESSAY
title: "Masa Depan Antarmuka Software Berbasis AI"
title_en: "The Future of AI-Driven Software Interfaces"
date: "2 OKT 2026"
date_en: "OCT 2, 2026"
tags: ["AI", "UX", "Arsitektur"]
tags_en: ["AI", "UX", "Architecture"]
summary: "Ringkasan 1-2 kalimat untuk teaser kartu di website."
---

Tulis isi lengkap esai atau catatan Anda di sini menggunakan Markdown biasa.

### 1. Masalah Utama
Anda bisa menggunakan heading, paragraf, daftar bullet, maupun kutipan.

### 2. Kesimpulan & Aksi Nyata
Ciel akan membaca seluruh teks ini sampai tuntas sehingga ketika pengunjung bertanya tentang topik ini, Ciel dapat menjawab dengan argumen yang sangat kaya dan akurat.
```

---

## Pilihan Kategori (`type`)
- `TAKE` (Opini / Hot-take tajam 1–3 paragraf)
- `THESIS` (Tesis sistem / arsitektur)
- `ESSAY` (Esai panjang / analisis mendalam / riset data)
- `NOTE` (Catatan singkat / prinsip operasional)
- `OBSERVATION` (Observasi tren atau perilaku industri)

---

## Cara Menerbitkan (Deploy)
Setelah menulis atau mengedit file `.md`:
Jalankan di terminal:
```bash
node deploy.js
```
*Script ini otomatis mengompilasi semua file markdown, memperbarui knowledge Ciel, memperbarui kartu di website, dan mengunggah langsung ke GitHub.*
