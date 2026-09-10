interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends BaseEntity {
  email: string;
  role: "admin" | "user";
  metadata: {
    loginCount: number;
    lastActive: Date;
  };
}

export type ApiResponseState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T; timestamp: number }
  | { status: "error"; error: Error; statusCode: number };

function renderUI(state: ApiResponseState<UserProfile>) {
  switch (state.status) {
    case "loading":
      return console.log("masih loading..");
    case "success":
      return console.log(
        `hey ${state.data.email}, login ke ${state.data.metadata.loginCount}`,
      );
    case "error":
      return console.log(
        `gagal memuat data. ini errornya: ${state.error.message}. status code: ${state.statusCode}`,
      );
    case "idle":
      return console.log(`saat ini sedang ${state.status}`);
  }
}

const testUser: UserProfile = {
  id: "123",
  createdAt: new Date(),
  updatedAt: new Date(),
  email: "rebel22@gmail.com",
  role: "admin",
  metadata: {
    loginCount: 1,
    lastActive: new Date(),
  },
};

console.log("-----Test Idle-----");
renderUI({ status: "idle" });

console.log("----Test Success------");
renderUI({ status: "success", data: testUser, timestamp: Date.now() });

console.log("----Test Loading------");
renderUI({ status: "loading" });

console.log("----Test Error------");
renderUI({ status: "error", error: new Error("test error"), statusCode: 500 });

function bye(name: string, goodBye: string = "selamat tinggal"): string {
  return `${goodBye}, ${name}`;
}

console.log("Test function-----------");
console.log(bye("Rebel", "sampai jumpa"));

function getLast<T>(arr: T[]): T | undefined {
  return arr.at(-1);
}

const numbers = [1, 2, 3];
const lastNumber = getLast(numbers);

console.log(lastNumber);

class Hewan {
  constructor(public name: string) {}

  speak(): void {
    console.log(`${this.name}, suara hewan`);
  }
}

class Anjing extends Hewan {
  speak(): void {
    console.log(`${this.name}, guk guk guk!!`);
  }
}

const anjing = new Hewan("Anjing");
anjing.speak();
