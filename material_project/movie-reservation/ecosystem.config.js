// ecosystem.config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  apps: [
    // {
    //   name: "api-gateway",
    //   script: "./services/api-gateway/src/index.ts",
    //   watch: true,
    //   interpreter: "bun",
    //   env: {
    //     PORT: process.env.PORT_GATEWAY,
    //     NODE_ENV: "development",
    //     JWT_SECRET: process.env.JWT_SECRET,
    //     USER_SERVICE_URL: process.env.USER_SERVICE_URL,
    //     CATALOG_SERVICE_URL: process.env.CATALOG_SERVICE_URL,
    //     BORROWING_SERVICE_URL: process.env.BORROWING_SERVICE_URL,
    //     REVIEW_SERVICE_URL: process.env.REVIEW_SERVICE_URL,
    //     NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL
    //   }
    // },
    {
      name: "users-service",
      script: "./services/users-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_USER,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL
      }
    },
    {
      name: "theaters-service",
      script: "./services/theaters-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_THEATERS,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL
      }
    },
    {
      name: "reservations-service",
      script: "./services/reservations-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_RESERVATIONS,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        THEATER_SERVICE_URL: process.env.THEATERS_SERVICE_URL,
        // CLOUDAMQP_URL: process.env.CLOUDAMQP_URL
      }
    },
    {
      name: "movie-service",
      script: "./services/movie-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_MOVIE,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        THEATER_SERVICE_URL: process.env.THEATERS_SERVICE_URL,
      }
    },
    {
      name: "tickets-service",
      script: "./services/tickets-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_TICKETS,
        USERS_SERVICE_URL: process.env.USERS_SERVICE_URL,
        SCHEDULE_SERVICE_URL: process.env.SCHEDULE_SERVICE_URL,
        RESERVATIONS_SERVICE_URL: process.env.RESERVATIONS_SERVICE_URL,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        CLOUDAMQP_URL: process.env.CLOUDAMQP_URL,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        SUCCESS_URL: process.env.SUCCESS_URL,
        CANCEL_URL: process.env.CANCEL_URL,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM,
        
      }
    }
  ]
}