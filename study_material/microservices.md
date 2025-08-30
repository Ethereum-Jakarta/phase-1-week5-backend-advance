# Microservices (Synchronous)

## 1. Apa itu Microservices?
Microservices adalah pendekatan arsitektur perangkat lunak yang membagi aplikasi menjadi serangkaian layanan kecil, mandiri, dan terdistribusi yang saling berinteraksi melalui API. Setiap layanan berfokus pada satu domain atau bisnis fungsional tertentu dan memiliki database dan pengelolaannya sendiri. Microservices memungkinkan pengembangan aplikasi yang lebih terdistribusi, skalabel, dan lebih mudah untuk dimodifikasi atau ditingkatkan.

Ciri-ciri Microservices:

- **Modularitas**: Setiap layanan menangani satu domain fungsional yang terpisah.
- **Independensi**: Setiap layanan dapat dikembangkan, diuji, dideploy, dan diskalakan secara independen.
- **Komunikasi Antar Layanan**: Microservices berkomunikasi melalui API (biasanya menggunakan HTTP, REST, gRPC, atau message queues).
- **Pengelolaan Data Mandiri**: Setiap microservice biasanya memiliki database sendiri (misalnya, database SQL atau NoSQL).

## 2. Keuntungan Menggunakan Microservices
Beberapa alasan utama untuk menggunakan arsitektur microservices dalam pengembangan aplikasi:

### A. Skalabilitas
- Layanan dapat diskalakan secara independen. Jika satu layanan lebih banyak digunakan daripada yang lain, hanya layanan tersebut yang dapat diskalakan tanpa mempengaruhi keseluruhan aplikasi.

### B. Peningkatan Kecepatan Pengembangan
- Pengembang dapat fokus pada bagian kecil dari aplikasi tanpa harus mempengaruhi bagian lain.
- Memungkinkan tim yang lebih kecil dan lebih terfokus pada satu layanan.w

### C. Kemudahan Pembaruan dan Pengelolaan
- Setiap layanan dapat diperbarui secara independen tanpa mempengaruhi aplikasi secara keseluruhan.
- Pembaruan atau perbaikan dapat dilakukan pada satu layanan tanpa harus menghentikan layanan lainnya.

### D. Ketahanan dan Toleransi Kesalahan
- Jika satu layanan gagal, sistem secara keseluruhan tidak akan terpengaruh.
- Pengelolaan kegagalan lebih mudah, dengan adanya fallback atau retry pada komunikasi antar layanan.

### E. Teknologi yang Beragam
- Microservices memungkinkan penggunaan berbagai teknologi, database, dan framework yang berbeda di setiap layanan sesuai dengan kebutuhan fungsionalnya.

## 3. Tantangan dalam Microservices

Meskipun microservices menawarkan banyak keuntungan, ada beberapa tantangan yang perlu dipertimbangkan saat merancang dan mengimplementasikan sistem berbasis microservices.

### A. Kompleksitas dalam Manajemen Layanan
- Dengan banyaknya layanan yang terdistribusi, pengelolaan sistem menjadi lebih kompleks, terutama dalam hal monitoring, logging, dan troubleshooting

### B. Komunikasi Antar Layanan
- Komunikasi antar layanan sering kali membutuhkan mekanisme yang tepat untuk memastikan keandalan, kecepatan, dan konsistensi data (misalnya, synchronous vs asynchronous).

### C. Konsistensi Data
Mempertahankan konsistensi data di seluruh layanan menjadi tantangan, terutama dalam aplikasi yang membutuhkan transaksi yang terdistribusi (misalnya, menggunakan teknik seperti Event Sourcing atau Saga Pattern).

### D. Pengelolaan Infrastruktur
Mikroservis memerlukan orkestrasi yang lebih baik, misalnya menggunakan Docker untuk containerization dan Kubernetes untuk orchestrasi dan manajemen kontainer.

## 4. Arsitektur Microservices
Arsitektur microservices melibatkan beberapa komponen yang saling berinteraksi. Berikut adalah gambaran umum dari arsitektur microservices yang sederhana:

### 4.1. Komponen Utama dalam Arsitektur Microservices:

- API Gateway:

    - API Gateway bertindak sebagai pintu masuk utama untuk aplikasi, yang mengarahkan permintaan ke layanan yang tepat.
    - Selain routing, API Gateway juga bisa melakukan otentikasi, otorisasi, rate-limiting, caching, dan logging.

- Microservices:

    - Setiap layanan menangani satu tanggung jawab atau domain bisnis tertentu.
    - Setiap microservice memiliki database sendiri dan dikelola secara independen.

- Database Per Layanan:

    - Setiap microservice memiliki pengelolaan database terpisah yang sesuai dengan fungsinya.
    - Misalnya, User Service menggunakan database SQL, sedangkan Order Service bisa menggunakan database NoSQL.


- Message Queue (Opsional):

    - Microservices sering kali berkomunikasi menggunakan message brokers seperti RabbitMQ, Apache Kafka, atau NATS, untuk pengolahan pesan secara asinkron dan mengurangi ketergantungan langsung antar layanan.


### 4.2. Diagram Arsitektur Microservices
pada dasarnya arsitektur microservice di bagi menjadi 2 yaitu `database per service` atau `schema per service`

#### 4.2.1 Database per Service
`Pengertian`:
Setiap microservice memiliki database sendiri yang benar-benar terpisah. Database ini hanya dapat diakses oleh microservice yang bersangkutan.

`Ciri-Ciri`:
Setiap service memiliki database independen (misalnya, MySQL untuk UserService, PostgreSQL untuk ProductService).
Tidak ada akses langsung antar database dari service lain.
Data di setiap database tidak saling berbagi secara langsung (harus melalui API atau event).

#### Kelebihan:
- `Independensi Total`:
Setiap service dapat memilih database terbaik untuk kebutuhannya (SQL, NoSQL, dll.).
Pengembangan dan pengelolaan service lebih fleksibel.
- `Isolasi Kegagalan`:
Jika satu database bermasalah, hanya service terkait yang terpengaruh.
- `Skalabilitas Tinggi`:
Service dan databasenya dapat diskalakan secara terpisah tanpa memengaruhi service lain.

#### Kekurangan:
- `Data Duplication`:
Informasi yang sama mungkin perlu disimpan di beberapa database, sehingga menambah kompleksitas sinkronisasi data.
- `Kompleksitas Pengelolaan`:
Memerlukan lebih banyak infrastruktur (misalnya, beberapa instance database).
- `Query Cross-Service Sulit`:
Tidak ada cara langsung untuk meng-query data dari beberapa database; perlu API atau event-driven architecture.

contoh gambar arsitektur Database per Service:

```js
                      +------------------+
                      |   API Gateway    |
                      | (Routing Layer)  |
                      +------------------+
                               |
               +----------------------------------+
               |                                  |
   +-------------------+                 +-------------------+
   |  User Service     |                 |   Order Service   |
   |  (Microservice)   |                 |  (Microservice)   |
   +-------------------+                 +-------------------+
            |                                  |
        +------------+                     +------------+
        |  Database  |                     |  Database  |
        |  (User DB) |                     | (Order DB) |
        |  MongoDB   |                     | MysSQL     |
        +------------+                     +------------+
```

#### 4.2.2 Service per Schema
#### Pengertian:
- Setiap microservice memiliki schema sendiri di dalam satu database bersama. Schema ini digunakan untuk menyimpan data terkait dengan service tersebut.

#### Ciri-Ciri:
- Satu database digunakan bersama oleh beberapa microservices.
- Setiap schema di dalam database didedikasikan untuk satu service.
- Service lain tidak dapat mengakses schema yang bukan miliknya (pembatasan dilakukan di tingkat aplikasi atau akses database).

#### Kelebihan:
- `Pengelolaan Lebih Mudah`: Satu database lebih mudah dikelola daripada banyak database.
- `Efisiensi Infrastruktur`: Hanya membutuhkan satu instance database, mengurangi overhead biaya infrastruktur.
- `Kemudahan Query Cross-Service`: Meskipun sebaiknya dihindari, query antar schema lebih mudah dilakukan jika benar-benar diperlukan.

#### Kekurangan:
- `Keterikatan Antar Service`: Jika database bermasalah, semua service bisa terpengaruh.
Membutuhkan pembatasan akses ketat agar service tidak saling mengganggu.
- `Skalabilitas Terbatas`: Database yang sama digunakan oleh banyak service, sehingga menjadi bottleneck jika skala meningkat.

#### Keamanan dan Isolasi:
Risiko kebocoran data lebih besar jika schema tidak diproteksi dengan baik.

contoh gambar arsitektur Service per Schema:

```js
                      +------------------+
                      |   API Gateway    |
                      | (Routing Layer)  |
                      +------------------+
                               |
               +----------------------------------+
               |                                  |
   +-------------------+                 +--------------------+
   |  User Service     |                 |   Order Service    |
   |  (Microservice)   |                 |  (Microservice)    |
   | Schema User Table |                 | Schema Order Table |
   +-------------------+                 +--------------------+
            |                                  |
        +-----------------------------------------------+
        |                   Database                    |
        |            microservice big DATABASE          |
        +-----------------------------------------------+
```

Penjelasan Komponen:
- API Gateway bertanggung jawab untuk menangani semua permintaan dan mendistribusikannya ke layanan yang sesuai (misalnya, User Service atau Order Service).
- Microservices adalah layanan independen yang menangani fungsionalitas tertentu. Masing-masing layanan memiliki database terpisah dan berkomunikasi melalui API atau pesan.
- Database Per Layanan: Setiap layanan memiliki database terpisah, memastikan bahwa satu layanan tidak mengganggu data layanan lain.

## 5.  Pola Desain Microservices
Ada beberapa pola desain dan prinsip yang biasa digunakan dalam pengembangan microservices:

### 5.1. Single Responsibility Principle
- Setiap microservice harus memiliki satu tanggung jawab atau fungsionalitas yang jelas, misalnya, User Service hanya menangani manajemen pengguna, sedangkan Order Service hanya menangani pesanan.

### 5.2. API First Design
- Mendesain API sebelum implementasi kode untuk memastikan bahwa komunikasi antar microservices berjalan lancar.
- Pendekatan ini sangat penting untuk standar komunikasi dan interaksi antar layanan.

### 5.3. Database Architecture
- Setiap microservice memiliki database sendiri untuk memastikan bahwa data dikelola secara mandiri tanpa saling bergantung.

### 5.4. Event-Driven Architecture
- Penggunaan event-driven architecture dapat mengurangi keterikatan antar layanan.
- Layanan dapat berkomunikasi dengan event bus atau message queue untuk mengirimkan informasi secara asinkron.

### 5.5. Saga Pattern
- Digunakan untuk mengelola transaksi terdistribusi. Misalnya, jika beberapa microservices perlu melakukan beberapa operasi dalam satu transaksi, Saga Pattern akan memastikan bahwa transaksi tersebut dikelola dengan benar dan menghindari data yang tidak konsisten.

## 6. Synchronous dan Asynchronous dalam Microservices

### 1. Synchronous Communication
Synchronous communication adalah metode komunikasi di mana layanan pengirim (caller) menunggu respons dari layanan penerima (callee) sebelum melanjutkan proses.

**Ciri-Ciri**:
- `Blokir Proses`: Caller menunggu sampai callee memberikan respons.
Komunikasi langsung: Biasanya menggunakan protokol seperti HTTP/REST atau gRPC.
- `Terkait waktu`: Caller dan callee harus aktif dan responsif pada saat yang sama.
Contoh dalam Microservices:
- `HTTP/REST API`: Service A mengirimkan permintaan ke Service B melalui HTTP dan menunggu respons.
- `gRPC`: Protokol komunikasi yang cepat dan mendukung synchronous calls.

**Kelebihan**:
- `Sederhana`: Mudah diimplementasikan dan dikelola.
- `Integrasi langsung`: Data yang diterima langsung digunakan oleh caller.
- `Debugging lebih mudah`: Alur permintaan dan respons lebih jelas.

**Kekurangan**:
- `Keterikatan waktu`: Jika Service B lambat atau tidak responsif, Service A juga akan terblokir.
- `Reliabilitas rendah`: Jika Service B down, permintaan dari Service A gagal.
- `Skalabilitas terbatas`: Beban meningkat jika banyak permintaan simultan.

### 2. Asynchronous Communication
Asynchronous communication adalah metode komunikasi di mana layanan pengirim (caller) tidak menunggu respons dari layanan penerima (callee). Sebagai gantinya, pengirim melanjutkan prosesnya, dan callee menangani permintaan di waktu lain.

**Ciri-Ciri**:
- `Non-blokir`: Caller tidak perlu menunggu respons.
- `Komunikasi tidak langsung`: Biasanya menggunakan message broker (Kafka, RabbitMQ, atau Redis).
- `Decoupling`: Caller dan callee tidak harus aktif atau responsif pada waktu yang sama.
**Contoh dalam Microservices**:
-` Message Queue`: Service A mengirim pesan ke RabbitMQ, dan Service B memproses pesan tersebut secara terpisah.
- `Event Streaming`: Service A mempublikasikan event ke Kafka, dan Service B bertindak sebagai subscriber yang menerima event.
**Kelebihan**:
-` Skalabilitas tinggi`: Tidak ada penundaan, dan pesan dapat diproses secara paralel.
- `Toleransi kegagalan`: Jika Service B down, pesan tetap disimpan di queue hingga Service B kembali aktif.
- `Decoupling`: Layanan dapat dikembangkan dan dikelola secara independen.
**Kekurangan**:
- `Kompleksitas lebih tinggi`: Membutuhkan infrastruktur tambahan seperti message broker.
- `Kesulitan debugging`: Lebih sulit melacak alur data karena komunikasi tidak langsung.
- `Latency tambahan`: Respons mungkin tidak instan karena pesan harus melalui perantara.

berikut kesimpulan perbandingan

| Aspek  | Synchronous | Asynchronous  | 
| ----- | --- | ----- |
| Proses Komunikasi   | Caller menunggu respons dari callee.  | Caller tidak menunggu respons.   |
| Keterikatan Waktu | Kedua layanan harus aktif pada saat yang sama.  | Tidak tergantung waktu, menggunakan perantara.  | 
| Kecepatan Respons | Respons langsung diterima. | Respons bisa tertunda. |
| Reliabilitas | Rentan terhadap kegagalan layanan. | Toleransi kegagalan lebih tinggi. | 
| Kompleksitas   | Mudah diimplementasikan. | Membutuhkan infrastruktur tambahan. | 
| Contoh Teknologi | HTTP/REST, gRPC | Kafka, RabbitMQ, Redis Streams | 

## 7. Implementasi Microservices
Berikut adalah langkah-langkah umum dalam mengimplementasikan microservices:

**Langkah 1**: Desain dan Pembagian Layanan
- Tentukan domain bisnis yang akan dipisah menjadi layanan terpisah (misalnya, User Service, Order Service, Payment Service).

**Langkah 2**: Pilih Teknologi yang Tepat
- Pilih teknologi yang tepat untuk setiap layanan, seperti database, bahasa pemrograman, framework, dan teknologi komunikasi antar layanan.

**Langkah 3**: Pengelolaan Database
- Tentukan apakah setiap layanan akan menggunakan database terpisah atau akan berbagi database yang sama (biasanya disarankan menggunakan database terpisah untuk menghindari ketergantungan).

**Langkah 4**: Kembangkan API
- Kembangkan API untuk komunikasi antar layanan (bisa menggunakan REST, gRPC, atau GraphQL).

**Langkah 5**: Orkestrasi dan Deployment
- Gunakan Docker dan Kubernetes untuk melakukan containerization dan orchestration layanan-layanan tersebut.

**Langkah 6**: Monitoring dan Logging
- Gunakan tools seperti Prometheus, Grafana, atau ELK Stack untuk monitoring dan logging di seluruh layanan microservices.

## 8. Alat dan Teknologi yang Digunakan dalam Microservices

- **Docker**: Untuk containerization dan pembuatan lingkungan terisolasi.
- **Kubernetes**: Untuk orkestrasi container dan manajemen skala layanan.
- **API Gateway**: Seperti Kong, Zuul, atau NGINX untuk manajemen API.
- **Message Queue**: Seperti RabbitMQ, Kafka, atau NATS untuk komunikasi asinkron.
- **Databases**: Bisa menggunakan berbagai jenis database sesuai dengan kebutuhan layanan (misalnya MongoDB, PostgreSQL, Cassandra).
- **Monitoring dan Logging**: Tools seperti Prometheus, Grafana, Elasticsearch, Kibana, atau Datadog.

Setelah ini kalian akan membuat contoh microservice Synchronous dan Asynchronous.
