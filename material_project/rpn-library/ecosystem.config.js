// ecosystem.config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  apps: [
    {
      name: "api-gateway",
      script: "./services/api-gateway/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_GATEWAY,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        USER_SERVICE_URL: process.env.USER_SERVICE_URL,
        CATALOG_SERVICE_URL: process.env.CATALOG_SERVICE_URL,
        BORROWING_SERVICE_URL: process.env.BORROWING_SERVICE_URL,
        REVIEW_SERVICE_URL: process.env.REVIEW_SERVICE_URL,
        NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL
      }
    },
    {
      name: "user-service",
      script: "./services/user-service/src/index.ts",
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
      name: "catalog-service",
      script: "./services/catalog-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_CATALOG,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL
      }
    },
    {
      name: "borrowing-service",
      script: "./services/borrowing-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_BORROWING,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        CATALOG_SERVICE_URL: process.env.CATALOG_SERVICE_URL,
        CLOUDAMQP_URL: process.env.CLOUDAMQP_URL
      }
    },
    {
      name: "review-service",
      script: "./services/review-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_REVIEW,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        CATALOG_SERVICE_URL: process.env.CATALOG_SERVICE_URL
      }
    },
    {
      name: "notification-service",
      script: "./services/notification-service/src/index.ts",
      watch: true,
      interpreter: "bun",
      env: {
        PORT: process.env.PORT_NOTIFICATION,
        NODE_ENV: "development",
        JWT_SECRET: process.env.JWT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        CLOUDAMQP_URL: process.env.CLOUDAMQP_URL,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM
      }
    }
  ]
}