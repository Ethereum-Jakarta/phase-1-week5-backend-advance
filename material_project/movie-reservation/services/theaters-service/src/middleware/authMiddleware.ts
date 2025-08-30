  export const authMiddleware = async ({ jwt, set, cookie }: any) => {
    const authToken = cookie?.auth?.value; // Pastikan cookie auth tersedia
    if (!authToken) {
      set.status = 401;
      return { error: 'Unauthorized: No token provided' };
    }

    try {
      // Verifikasi token JWT
      const payload = await jwt.verify(authToken);

      if (!payload || !payload.userId) {
        set.status = 401;
        return { error: 'Unauthorized: Invalid token' };
      }

      // Return user data agar bisa digunakan di route lain
      return 
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      set.status = 401;
      return { error: 'Unauthorized: Token expired or invalid' };
    }
  }