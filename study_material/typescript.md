# Typescript

TypeScript adalah bahasa pemrograman yang dikembangkan oleh Microsoft sebagai *superset* dari JavaScript. Artinya, semua kode JavaScript valid di TypeScript, tetapi TypeScript menambahkan fitur tambahan seperti **static typing** dan **tooling yang lebih baik**. Mari kita pelajari secara detail!

***Cara Kerja Typescript***

![image](https://github.com/user-attachments/assets/4bde23d9-fa35-4e8b-a9c3-bc794d25cbcb)

Berikut adalah rangkuman singkat alur kerja TypeScript :

1. **Kode TypeScript (`.ts`)**:
   - Kode ditulis menggunakan TypeScript, yang mencakup fitur seperti **class**, **interface**, **module**, dan **custom types**.

2. **TypeScript Compiler (`tsc`)**:
   - Compiler TypeScript (`tsc`) digunakan untuk mengompilasi (atau mentranspilasi) kode TypeScript menjadi JavaScript.
   - Proses ini memeriksa kesalahan tipe dan masalah lainnya.

3. **Kompilasi/Transpilasi**:
   - Kode TypeScript diubah menjadi JavaScript. Target versi JavaScript (ES3, ES5, ES6, dll.) dapat ditentukan di file `tsconfig.json`.

4. **Kode JavaScript (`.js`)**:
   - Hasil kompilasi adalah file JavaScript yang berisi kode JavaScript standar.

5. **Eksekusi Kode JavaScript**:
   - Kode JavaScript yang dihasilkan dapat dijalankan di mana saja yang mendukung JavaScript, seperti browser atau Node.js.

Alur ini memungkinkan developer menggunakan TypeScript untuk develop yang lebih aman dan terstruktur, sambil tetap memastikan kompatibilitas dengan semua platform JavaScript.

### **1. Mengapa TypeScript?**
#### **Perbandingan JavaScript vs TypeScript**
- **JavaScript**: 
  ```javascript
  function add(a, b) {
    return a + b;
  }
  console.log(add("5", 3)); // Output: "53" (tidak diinginkan)
  ```
  Error tidak terdeteksi sampai runtime.

- **TypeScript**:
  ```typescript
  function add(a: number, b: number): number {
    return a + b;
  }
  console.log(add("5", 3)); // Error: Type 'string' is not assignable to type 'number'.
  ```
  Error langsung terdeteksi saat penulisan kode (compile-time).

#### **Keuntungan TypeScript**
- **Deteksi Error Lebih Awal**: Sebelum kode dijalankan.
- **Kode Lebih Mudah Dipahami**: Tipe data membuat logika lebih jelas.
- **Autocomplete Lebih Cerdas**: Editor seperti VS Code bisa menyarankan properti objek.
- **Dukungan OOP**: Class, interface, inheritance, dll.

---

### **2. Setup TypeScript**
#### **Instalasi**
1. Install Node.js: [https://nodejs.org](https://nodejs.org)
2. Install TypeScript secara global:
   ```bash
   npm install -g typescript
   ```
3. Cek versi:
   ```bash
   tsc --version
   ```

#### **Proyek Pertama**
1. Buat file `index.ts`:
   ```typescript
   const message: string = "Hello, TypeScript!";
   console.log(message);
   ```
2. Compile ke JavaScript:
   ```bash
   tsc index.ts
   ```
3. Jalankan hasil kompilasi:
   ```bash
   node index.js
   ```

Sebenarnya banyak libraryjs sudah otomatis ter setup dengan konfigurasi Typescript, jadi kalian tidak perlu manual install Typescript ke dalam project kalian.
Seperti `but init` disini standardnya sudah menggunakan Typescript>

![image](https://github.com/user-attachments/assets/d912e92d-2aad-4799-89cb-682b83a5ad1b)

---

### **3. Tipe Data Dasar (Primitive Types)**
#### **Daftar Tipe**
- `number`: Angka (integer, float, dll).
- `string`: Teks.
- `boolean`: `true` atau `false`.
- `null`/`undefined`: Nilai kosong.
- `void`: Fungsi yang tidak mengembalikan nilai.
- `any`: Tipe dinamis (hindari sebisa mungkin).
- `never`: Untuk fungsi yang selalu throw error atau infinite loop.

#### **Contoh Penggunaan**
```typescript
let age: number = 25;
let name: string = "Alice";
let isActive: boolean = true;

function logError(message: string): void {
  console.error(message);
}

let dynamicValue: any = "Ini bisa apa saja";
dynamicValue = 42; // Tidak error, tapi tidak direkomendasikan.

function throwError(message: string): never {
  throw new Error(message);
}
```

---

### **4. Tipe Data Kompleks**
#### **Array**
```typescript
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];
```

#### **Tuple**
Array dengan tipe data yang sudah ditentukan untuk setiap indeks.
```typescript
let user: [string, number, boolean] = ["Alice", 30, true];
user[0] = "Bob"; // Valid
user[1] = "30"; // Error: Type 'string' is not assignable to type 'number'.
```

#### **Object**
```typescript
let person: {
  name: string;
  age: number;
  isStudent?: boolean; // Properti opsional
} = {
  name: "Alice",
  age: 25,
};
```

---

### **5. Interface dan Type Alias**
#### **Interface**
- Untuk mendefinisikan bentuk objek.
- Bisa extends atau di-implement oleh class.
```typescript
interface Person {
  name: string;
  age: number;
}

const alice: Person = {
  name: "Alice",
  age: 25,
};
```

#### **Type Alias**
- Memberi nama baru ke tipe yang sudah ada.
- Cocok untuk union atau intersection types.
```typescript
type ID = string | number;
type Coordinates = [number, number];
type User = Person & { id: ID }; // Intersection type
```

---

### **6. Fungsi**
#### **Parameter dan Return Type**
```typescript
function multiply(a: number, b: number): number {
  return a * b;
}
```

#### **Optional dan Default Parameters**
```typescript
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

console.log(greet("Alice")); // Output: "Hello, Alice!"
console.log(greet("Bob", "Hi")); // Output: "Hi, Bob!"
```

#### **Arrow Function**
```typescript
const divide = (a: number, b: number): number => a / b;
```

---

### **7. Generics**
Membuat komponen yang bisa bekerja dengan berbagai tipe data.
```typescript
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const numbers = [1, 2, 3];
const firstNumber = getFirst(numbers); // Tipe firstNumber: number

const strings = ["a", "b", "c"];
const firstString = getFirst(strings); // Tipe firstString: string
```

---

### **8. Advanced Types**
#### **Union Type**
Variabel bisa memiliki beberapa tipe.
```typescript
let id: string | number = "ABC123";
id = 123; // Valid
```

#### **Type Guards**
Memeriksa tipe data saat runtime.
```typescript
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}
```

---

### **9. Class dan OOP**
```typescript
class Animal {
  constructor(public name: string) {} // Modifier 'public' otomatis assign ke properti

  speak(): void {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  speak(): void {
    console.log(`${this.name} barks!`);
  }
}

const dog = new Dog("Buddy");
dog.speak(); // Output: "Buddy barks!"
```

---

### **10. Decorators**
Menambahkan perilaku ke class, method, atau properti.
```typescript
function Log(target: any, methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Method ${methodName} dipanggil dengan args: ${args}`);
    return originalMethod.apply(this, args);
  };
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3); // Output: "Method add dipanggil dengan args: 2,3"
```

---

### **Best Practices**
1. **Aktifkan Strict Mode**: Di `tsconfig.json`, set `strict: true`.
2. **Hindari `any`**: Gunakan `unknown` atau tipe yang lebih spesifik.
3. **Gunakan Interface untuk Objek**: Lebih mudah di-extend.
4. **Union Type daripada Enum**:
   ```typescript
   type Status = "active" | "inactive" | "pending"; // Lebih direkomendasikan
   ```
5. **Komentar dan Dokumentasi**:
   ```typescript
   /**
    * Menambahkan dua angka.
    * @param a Angka pertama.
    * @param b Angka kedua.
    * @returns Jumlah dari a dan b.
    */
   function add(a: number, b: number): number {
     return a + b;
   }
   ```

---

### **Error Umum dan Solusi**
1. **Type 'X' is not assignable to type 'Y'**:
   - Pastikan tipe data variabel sesuai dengan nilai yang diassign.
2. **Object is possibly 'null' or 'undefined'**:
   - Gunakan optional chaining (`?.`) atau null check.
   ```typescript
   const name = user?.name || "Default";
   ```

---

Dengan memahami konsep-konsep di atas, Kalian sudah siap membangun aplikasi menggunakan TypeScript! 
Mulailah dengan project kecil dan secara bertahap eksplor fitur-fitur lanjutan seperti **utility types** (`Partial`, `Pick`, dll) dan **namespace**. 

Happy coding! 🚀
