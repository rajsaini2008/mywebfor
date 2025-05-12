# Cara Menyimpan Gambar di Aplikasi

## Metode yang Digunakan

Aplikasi ini menggunakan metode penyimpanan gambar yang efisien:

1. **Image URL di form dimasukkan ke database** — metode ini paling efisien untuk web development.
2. **File disimpan di server lokal** (di folder /public/uploads)
3. **URL gambar disimpan di database** untuk ditampilkan

## Langkah-langkah (Step-by-Step)

### Step 1: Image Upload
- User/admin mengupload gambar melalui form
- File dibaca dari form input

### Step 2: Server Image Save
- Backend (Node.js) menerima file dan menyimpannya
- File disimpan di folder `/public/uploads/` dengan sub-folder sesuai jenis (students/photos, courses, dll)

### Step 3: URL Generation
- Setelah file disimpan, URL publik dibuat:
  - Format: `/uploads/[folder]/[filename]`
  - Contoh: `/uploads/courses/1621234567-computer-course.jpg`

### Step 4: URL di Database
- URL gambar disimpan di field database (MongoDB)
- Field seperti `imageUrl`, `photoUrl`, dll

## Kode yang Digunakan

### Upload File (Frontend)
```javascript
// Upload gambar kursus
async function uploadCourseImage(file, courseId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('courseId', courseId);
  
  const response = await fetch('/api/course-image-upload', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  return result.url; // URL yang akan disimpan di database
}
```

### Menyimpan File (Backend)
```javascript
// API untuk menyimpan file
export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  
  // Proses file
  const buffer = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  
  // Simpan file ke folder
  const filePath = path.join('public/uploads', filename);
  await writeFile(filePath, Buffer.from(buffer));
  
  // Buat URL publik
  const url = `/uploads/${filename}`;
  
  // Simpan URL di database (contoh)
  await updateDatabase(id, { imageUrl: url });
  
  return { success: true, url };
}
```

## Keuntungan Metode Ini

### Kelebihan
- Database lebih ringan (hanya menyimpan URL teks)
- Gambar dapat diakses cepat via CDN
- Mudah untuk backup/migrasi
- Bekerja baik dengan frontend

### Kekurangan (Minor)
- Perlu mengelola penyimpanan file
- URL gambar bisa mati jika file dihapus 