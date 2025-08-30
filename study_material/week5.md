# Week5-Backend-Advance-Concept

Hello phase 1 fighter, ini week terakhir di phase 1. di week ini akan ada banyak Logic Nolep karena kita akan mengerjakan project project backend dengan set up backend yang sudah kita buat di week4. di week ini juga ada berapa theory konsep yang harus kalian pelajari, karena backend itu bukan melulu tentang API.di week5 kita harus membuat dokumentasi backend dengan baik agar front end mudah memahami API yang kita buat. trus kita belajar struktur lain dalam backend seperti perbedaan monolith dan microservices. kita belajar sistem cache memakai redis. dan belajar templating engine menggunakan EJS untuk visualisasi project yang kalian buat.

sebelum kalian memakai full template backend yang gua kasih di week5, kalian harus menyelesaikan Logic Nolep Inventory System dulu.
langsung aja kita mulai week5 , dengan Logic Nolep (Finishing Inventory System).

***Logic Nolep Finishing IS***
- selesaikan semua CRUD dari project IS

- gunakan system quantity stock (setiap order dibuat, quantity di product akan berkurang sesuai data orderItem)

- tambahkan api search product by category (input text search wajib memakai req.query)

- semua getAll API wajib menggunakan pagination. input page dan size bisa kalian setting di req.query

https://www.prisma.io/docs/concepts/components/prisma-client/pagination#-cons-of-offset-pagination

-authorization, authorization disini berfungsi untuk otoritas user role pada API:
    ->user : user hanya bisa akses API auth, product, category
    ->admin : bisa akses semua API, termasuk CRUD User.
buatlah authorization middleware versi kalian sendiri 
