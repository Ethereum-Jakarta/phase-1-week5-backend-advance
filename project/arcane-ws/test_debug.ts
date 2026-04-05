import app from "./src";

// Test register
const registerResponse = await app.handle(
  new Request("http://localhost/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "debuguser",
      email: "debug@example.com",
      password: "DebugPass123!",
    }),
  }),
);

console.log("Register Status:", registerResponse.status);
console.log("Register Headers:", Object.fromEntries(registerResponse.headers));
const registerData = await registerResponse.json();
console.log("Register Data:", registerData);
