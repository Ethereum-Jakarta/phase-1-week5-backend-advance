# Bun
## 1. Apa itu Bun.js?
Bun.js adalah runtime JavaScript modern yang sangat cepat, dirancang sebagai alternatif untuk Node.js dan Deno. Bun.js dibuat untuk memberikan performa tinggi dan efisiensi yang lebih baik dalam menjalankan aplikasi berbasis JavaScript atau TypeScript.

***Fitur Utama Bun.js***

- **Runtime Cepat** : Bun.js dibangun menggunakan Zig, sebuah bahasa pemrograman yang sangat cepat, untuk memberikan performa tinggi.
- **Built-in Bundler** : Tidak memerlukan alat tambahan seperti Webpack atau Parcel, karena Bun.js memiliki bundler bawaan.
- **Built-in Transpiler** : Mendukung TypeScript dan JSX secara langsung tanpa konfigurasi tambahan.
- **Built-in Package Manager** : Seperti npm atau yarn, Bun.js memiliki pengelola paket sendiri yang sangat cepat.
- **Kompatibilitas Node.js** : Mendukung sebagian besar API Node.js, sehingga mempermudah migrasi aplikasi.

## 2. Kenapa Menggunakan Bun.js?
- **Kecepatan** : Bun.js jauh lebih cepat dibandingkan Node.js atau Deno.
- **Kemudahan** : Menggabungkan runtime, bundler, dan package manager ke dalam satu alat.
- **Produktivitas** : Membutuhkan lebih sedikit konfigurasi dibandingkan ekosistem lain.
- **Penggunaan Modern** : Secara langsung mendukung TypeScript, JSX, dan ESModules.

## 3. Instalasi Bun.js
Untuk mulai menggunakan Bun.js, ikuti langkah-langkah berikut:

a. Prasyarat
Pastikan kalian memiliki Node.js (opsional) dan npm atau Homebrew terinstal di sistem Anda.

b. Instalasi:
1. Menggunakan curl: Jalankan perintah berikut di terminal Anda:
```bash
curl -fsSL https://bun.sh/install | bash
```
2. Menggunakan Homebrew (macOS/Linux):
```bash
brew tap oven-sh/bun
brew install bun
```
3. Cek Instalasi: Pastikan Bun.js sudah terinstal dengan menjalankan:
```bash
bun --version
```

## 4. Dasar-Dasar Penggunaan Bun.js

a. Menjalankan File JavaScript
Untuk menjalankan file JavaScript menggunakan Bun.js:
```bash
bun run file.js
```
b. Membuat Server HTTP
Bun.js kompatibel dengan API Node.js, sehingga kalian dapat menggunakan modul bawaan seperti http untuk membuat server.
```js
import { createServer } from "http";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Bun.js!");
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
```
kemuadian untuk menjalankan code
```bash
bun run server.js
```
atau bisa menjalankan file secara langsung
```bash
bun run file.ts
```
## 4.Package Manager di Bun.js
Bun.js memiliki pengelola paket bawaan yang sangat cepat, sehingga tidak memerlukan npm atau yarn.

Contoh: 

a. Menginstal Paket
```bash
bun add express
```

b. Menghapus Paket
```bash
bun remove express
```

c. Menjalankan Skrip
Jika kalian memiliki file package.json dengan skrip, kalian dapat menjalankannya seperti ini:
```bash
bun run start
```

## 6. Built-in Bundler

Bun.js memiliki bundler bawaan, yang memungkinkan kalian untuk menggabungkan (bundle) aplikasi secara langsung.

**Contoh Bundling File**

Misalkan kalian memiliki beberapa file:

- index.js
- helper.js

Jalankan perintah bundling:
```bash
bun bundle index.js > bundle.js
```
Ini akan menghasilkan file bundle.js yang berisi semua kode yang dibutuhkan.

## 7. Komparasi Bun.js dengan Node.js dan Deno

| Fitur  | Bun.js | Node.js  | Deno |
| ----- | --- | ----- | --- |
| Kecepatan   | Sangat Cepat  | Cepat   | Cepat  |
| Package Manager | Built-in  | npm/yarn   | None  |
| TypeScript   | Built-in  | Membutuhkan Transpiler   | Built-in  |
| Bundler | Built-in  | 	Harus Menggunakan Alat Eksternal   | Built-in  |
| API Node.js   | 	Sebagian Besar Didukung  | Lengkap   | Tidak Didukung Langsung  |


## 8. Setup Project Bun.js

1. buat folder project
```
mkdir bun-app
cd bun-app
```

2. Inisialisasi proyek:
```bash
bun init
```

3. Tambahkan file index.js
```bash
console.log("Hello, Bun.js!");
```

4. Jalankan Aplikasi
```
bun run index.js
```

5. Menggunakan Paket NPM
Bun.js mendukung paket npm, sehingga kalian bisa menggunakannya seperti Node.js.

Contoh dengan Express.js:
```
bun add express
```


***Kedepannya untuk pembelajaran week5, kalian diwajibkan untuk meggunakan Bun + Typescript!***
