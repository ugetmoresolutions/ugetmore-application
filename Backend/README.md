# U-GETMO Backend

E-commerce backend API for U-GETMO — a platform that supplies school uniforms, stationery, furniture, and branded products with multiple supplier integrations.

## Tech Stack

| Layer          | Technology                                                   |
| -------------- | ------------------------------------------------------------ |
| **Runtime**    | Node.js 20                                                   |
| **Language**   | TypeScript                                                    |
| **Framework**  | Express.js                                                    |
| **Database**   | SQL Server (mssql) via Sequelize ORM                          |
| **Cache**      | Redis (ioredis)                                               |
| **Auth**       | Firebase Auth + JWT (jsonwebtoken)                            |
| **Email**      | SendGrid / Nodemailer                                         |
| **File Store** | AWS S3                                                        |
| **Payments**   | PayFast                                                       |
| **Suppliers**  | Amrod, Parrot Products, Tarsus                                |
| **DI**         | typedi                                                        |
| **Validation** | class-validator / class-transformer                           |
| **Logging**    | Winston + Morgan                                              |
| **Testing**    | Jest + Supertest                                              |
| **Build**      | SWC (fast transpilation)                                      |
| **Deploy**     | PM2, Docker, AWS Lambda (serverless-http)                     |

## Prerequisites

- **Node.js** >= 20
- **npm**
- **SQL Server** instance (local or cloud)
- **Redis** instance (local or cloud)
- **AWS account** (S3 bucket + IAM credentials)
- **SendGrid API key** (for transactional emails)
- **PayFast merchant account** (for payment processing)
- **Firebase project** (for authentication)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your own values:

```bash
cp .env.example .env
```

Required variables in `.env`:

| Variable                  | Description                         |
| ------------------------- | ----------------------------------- |
| `PORT`                    | Server port (default: 4002)         |
| `DB_HOST`                 | SQL Server host                     |
| `DB_NAME`                 | Database name                       |
| `DB_USER`                 | Database username                   |
| `DB_PASSWORD`             | Database password                   |
| `SECRET_KEY`              | JWT signing secret                  |
| `JWT_EXPIRES_IN`          | JWT expiry (e.g., `2h`)             |
| `REDIS_URL`               | Redis connection string             |
| `AWS_ACCESS_KEY_ID`       | AWS access key                      |
| `AWS_SECRET_ACCESS_KEY`   | AWS secret key                      |
| `AWS_REGION`              | AWS region                          |
| `AWS_S3_BUCKET_NAME`      | S3 bucket for uploads               |
| `SEND_GRID_API_KEY_*`     | SendGrid API key (split parts)      |
| `FRONT_END_URL`           | Frontend URL (CORS origin)          |
| `PAYFAST_*`               | PayFast merchant credentials        |
| `AMROD_*`                 | Amrod supplier API credentials      |
| `PARROT_*`                | Parrot Products API config          |
| `TARSUS_*`                | Tarsus supplier API config          |

## Available Scripts

| Command               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Start dev server with hot-reload (nodemon + ts-node)  |
| `npm run build`       | Transpile TS to JS via SWC into `dist/`               |
| `npm start`           | Build then run production server                      |
| `npm test`            | Run test suite (Jest)                                 |
| `npm run lint`        | Lint source code                                      |
| `npm run lint:fix`    | Auto-fix lint issues                                  |
| `npm run deploy:dev`  | Deploy to dev via PM2                                 |
| `npm run deploy:prod` | Deploy to production via PM2                          |

## Development

Start the dev server with file watching and auto-restart:

```bash
npm run dev
```

- Listens on **PORT** (default: **4002**)
- Nodemon watches `src/` and `.env`
- Uses `ts-node` with path aliases (`tsconfig-paths`)

## Production Build

```bash
npm run build
```

Compiles TypeScript from `src/` to `dist/` using SWC (fast transpilation with source maps).

Run the compiled output:

```bash
node dist/server.js
```

Or use the combined script:

```bash
npm start
```

## Deployment Options

### PM2

The project includes `ecosystem.config.js` for process management:

```bash
npm run deploy:dev    # PM2 dev mode
npm run deploy:prod   # PM2 production mode
```

### Docker

Multi-stage `Dockerfile` targeting AWS Lambda:

```bash
docker build -t ugetmo-be .
docker run -p 4002:3000 ugetmo-be
```

### AWS Lambda

Compatible with Lambda via `serverless-http`. The Dockerfile uses the AWS Lambda Node.js 20 base image.

## Project Structure

```
src/
├── app.ts                    # Express app setup & DI container
├── server.ts                 # Entry point
├── config/                   # Environment variable exports
├── controllers/              # Route handlers
├── database/                 # Sequelize connection & associations
├── dots/                     # DTOs (auth, cart, product)
├── exceptions/               # Custom error classes
├── interfaces/               # TypeScript interfaces & DI tokens
├── middlewares/              # Express middlewares
├── models/                   # Sequelize models
├── repositories/             # Data access layer
├── routes/                   # Route definitions
├── services/                 # Business logic
├── types/                    # Shared type definitions
└── utils/                    # Logger, validation, scheduler
```

## API Routes

All routes are prefixed with `/api`:

| Route                    | Description                     |
| ------------------------ | ------------------------------- |
| `/api/auth`              | Authentication & users          |
| `/api/product`           | Product CRUD                    |
| `/api/category`          | Categories                      |
| `/api/subcategory`       | Subcategories                   |
| `/api/cart`              | Shopping cart                   |
| `/api/order`             | Orders                          |
| `/api/payment`           | PayFast processing              |
| `/api/supplier`          | Supplier management             |
| `/api/supplier-product`  | Supplier product mappings       |
| `/api/stock`             | Inventory                       |
| `/api/school`            | Schools                         |
| `/api/grade`             | Grades                          |
| `/api/grade-stationery`  | Grade-specific stationery lists |
| `/api/furniture`         | Furniture products              |
| `/api/coupon`            | Discount coupons                |
| `/api/newsletter`        | Newsletter subscriptions        |
| `/api/software-inquiry`  | Software inquiries              |
| `/api/notification`      | Notifications                   |
| `/api/product-aggregation` | Aggregated product search     |

## Testing

```bash
npm test
```

Uses **Jest** with **Supertest** for HTTP integration tests.
