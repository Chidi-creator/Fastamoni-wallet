# Fastamoni Wallet Server

## Project Overview
Fastamoni Wallet is a robust, scalable backend system designed to handle user wallets, financial transactions, and donations. The project emphasizes high performance, low latency, and security, utilizing modern technologies to ensure reliability under load.

## Goals Accomplished
The following features have been successfully implemented:
*   **User Management**:
    *   Create an account with basic user information.
    *   Secure user login with authentication tokens.
*   **Wallet System**:
    *   Each user is assigned a wallet upon registration.
    *   Support for wallet funding and balance management.
*   **Security**:
    *   Transaction PIN creation and updates for securing sensitive operations.
    *   Protection against unauthorized access using JWT strategies.
*   **Transactions & Donations**:
    *   Transfer funds (Donations) to fellow users.
    *   Real-time tracking of donation counts.
    *   **Automated Thank You Message**: If a user makes two (2) or more donations, a special thank you message is automatically sent via email.
*   **Data Visibility**:
    *   System capabilities to track donations over time.
    *   Detailed transaction logging for every financial action.

## API Response Format
The API uses a standardized JSON response structure for consistency across all endpoints.

**Success Response Example:**
```json
{
  "success": true,
  "status": 200,
  "message": "Operation successful",
  "data": {
    "count": 5
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Error Response Example:**
```json
{
  "success": false,
  "status": 401,
  "message": "Unauthorized access",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

## Scalability and Performance
The server is architected to handle high concurrency and ensure low latency through several key strategies:

1.  **Asynchronous Processing (BullMQ)**: Heavy operations such as sending emails (e.g., the thank you message) and processing bank transfers are offloaded to background queues. This ensures the main API remains responsive and fast, achieving low latency for user-facing requests.
2.  **Redis Caching**: Frequently accessed data, such as donation counts and bank lists, is cached in Redis to reduce database load and speed up read operations.
3.  **Connection Pooling**: Prisma Client manages a pool of connections to the PostgreSQL database, allowing the application to efficiently handle multiple simultaneous database queries without overhead.
4.  **Stateless Authentication**: JWT (JSON Web Tokens) are used for authentication, allowing the application to scale horizontally without maintaining session state on the server.

## Security and SQL Injection Prevention
The application prioritizes security, specifically addressing SQL injection risks:

*   **Prisma ORM**: The application uses Prisma Client for all database interactions. Prisma uses parameterized queries under the hood, effectively neutralizing SQL injection attacks. Instead of concatenating user input directly into SQL strings, Prisma treats input as data parameters, ensuring that malicious SQL code cannot be executed.
*   **Input Validation**: Strict input validation ensures that data adheres to expected formats before it even reaches the database layer.
*   **Transaction PIN**: Sensitive financial operations require a secondary Transaction PIN, adding an extra layer of security beyond the login password.

## API Endpoints Overview

### Authentication
*   `POST /users/register`: Register a new user.
*   `POST /auth/login`: Login and receive an access token.
*   `POST /auth/verify-otp`: Verify OTP for 2FA/Registration.

### Transactions
*   `POST /transactions/transfer`: Send money (donate) to another user.
    *   *Requires Transaction PIN.*
    *   *Triggers "Thank You" email worker if condition (2+ donations) is met.*
*   `POST /transactions/transfer/bank`: Withdraw funds to an external bank account.
*   `GET /transactions/donations/count`: Get the total number of donations made by the authenticated user (Cached).
*   `POST /transactions/pin`: Set a new Transaction PIN.
*   `PATCH /transactions/pin`: Update an existing Transaction PIN.

### Webhooks
*   `POST /transactions/webhook/flutterwave`: Handle payment provider updates.

### Accounts
*   `POST /accounts/resolve`: Resolve bank account details.
*   `GET /accounts/user`: Retrieve linked user bank accounts.

## Technology Stack
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Caching**: Redis
*   **Queues**: BullMQ
