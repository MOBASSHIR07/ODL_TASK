# Multi-Tenant Resource Booking & Availability System 🏢

A high-performance, enterprise-grade backend REST API built to handle scheduling, role-based access, and resource booking in a multi-tenant corporate environment. Designed with security and strict scheduling isolation in mind, the platform ensures that organizations can seamlessly share assets like meeting rooms, desks, and testing devices without overlapping schedules or cross-tenant leaks.

---

## 🚀 Vision

To provide a secure, bulletproof, and highly extensible backend infrastructure for multi-tenant organizations. The core engine is built to solve time-allocation complexities—guaranteeing data isolation across tenants, enforcing organization-specific booking policies, and preventing concurrency anomalies (double-bookings) using a mathematically rigorous timezone-aware availability engine.

---

## ✨ Key Features

*   **🔒 Multi-Tenant Data Isolation**: Complete separation of concerns. All resources, user roles, configurations, and bookings are isolated under a database-indexed `tenantId` mapping, preventing cross-organization data leakage.
*   **🔑 Secure JWT Authentication & RBAC**:
    *   `ORG_ADMIN`: Grants authority to onboard employees, construct/modify/delete resources, and manage all organization bookings.
    *   `EMPLOYEE`: Restricts actions to browsing resources, querying availability slots, and managing/canceling their own bookings.
    *   Supports session tokens provided via HTTP `Authorization: Bearer <token>` headers or secure HttpOnly cookies.
*   **📦 Resource Lifecycle Management**: Full CRUD support for core resources: `MEETING_ROOM`, `DESK`, and `DEVICE`.
*   **🗑️ Soft Deletions**: Deleting a resource marks `isDeleted: true` in the database, preserving historical booking analytics while immediately removing it from active booking scopes.
*   **⚡ Dynamic Availability & Overlap Buffer Engine**:
    *   **Symmetric Buffer Window Protection**: When a resource is booked from $S$ to $E$ with a buffer time of $B$ minutes, the engine dynamically locks the time window starting at $S - B$ and ending at $E + B$.
    *   **Mathematical Conflict Resolution**: Before confirming any booking, the scheduler runs a database-level overlapping query:
        $$\text{Overlap} \iff (\text{Booking.StartTime} < \text{Requested.EndTime} + B) \land (\text{Booking.EndTime} > \text{Requested.StartTime} - B)$$
        This blocks conflicting bookings and ensures that turnaround times (cleaning, setup, transit) are strictly respected.
    *   **Timezone-Aware Generation**: Generates 30-minute incremental availability slots localized to the organization's business hours (e.g. `09:00` - `18:00`) and timezone config (e.g. `Asia/Dhaka`), computed via `Luxon` timezone calculations.
*   **🛡️ Request Validation**: Schema-level request validation using `Zod` to filter out malformed date strings, past bookings, and illogical start/end time arrangements.

---

## 🛠️ Tech Stack

*   **Runtime Environment**: Node.js (TypeScript)
*   **Framework**: Express.js (v5.x)
*   **Database**: MongoDB & Mongoose (ODM with nested indexes)
*   **Datetime Arithmetic**: Luxon (Timezone & ISO parsing)
*   **Validation Layer**: Zod
*   **Encryption & Security**: JSON Web Tokens (JWT) & BcryptJS

---

## ⚙️ Project Structure

```text
├── src/
│   ├── app.ts                 # Express initialization & routing middleware pipelines
│   ├── config/
│   │   └── db.ts              # Mongoose MongoDB connection pooling logic
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT authentication & RBAC policy enforcer
│   │   ├── errorMiddleware.ts # Centralized exception handling & AppError interface
│   │   └── validateMiddleware.ts # Zod validation schema wrapper
│   ├── modules/
│   │   ├── auth/              # Registration, Login controllers, routing & Zod validation schemas
│   │   ├── booking/           # Availability slot generator, scheduler & cancellation engines
│   │   ├── organization/      # Organization (Tenant) policies, working hours, and timezone models
│   │   ├── resource/          # Bookable assets CRUD controllers & schemas
│   │   └── user/              # User/Employee model schemas & account onboarding handlers
│   └── types/                 # Express Request overrides for auth user typing
├── server.ts                  # HTTP Server bootstrap and environment loader
├── tsconfig.json              # TypeScript target and module resolution configs
├── package.json               # Scripts and production/dev dependencies
└── .env                       # Environment credentials
```

---

## 🛠️ Getting Started

### Prerequisites
*   **Node.js** (v18.0.0 or higher)
*   **MongoDB** (Local daemon running or MongoDB Atlas connection URI string)

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and configure the environment variables as follows:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/booking-system?retryWrites=true&w=majority
JWT_SECRET=super_secret_session_token_key_for_multitenant_booking_system_2026
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000
```

### 3. Execution Commands
To start the application, refer to the scripts matrix below.

---

## 📜 Scripts Matrix Table

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `tsx watch server.ts` | Runs the server in development mode with automatic hot-reloading using TSX. |
| `npm run build` | `tsc` | Transpiles TypeScript files into pure, optimized ES6 JavaScript within `/dist`. |
| `npm run start` | `node dist/server.js` | Launches the compiled production application server from `/dist`. |

---

## 📡 API Reference Matrix

All API endpoints are prefixed with `/api`.

| Module | Method | Endpoint | Description | Access Role |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register-org` | Registers a new organization tenant alongside its default Org Admin user. | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticates a user and returns a signed JWT session token. | Public |
| **Users** | `POST` | `/api/users` | Onboards a new employee user account within the admin's tenant. | `ORG_ADMIN` |
| **Users** | `GET` | `/api/users` | Retrieves all onboarded employee accounts within the tenant. | `ORG_ADMIN` |
| **Resources** | `POST` | `/api/resources` | Creates a bookable resource (meeting room, desk, device). | `ORG_ADMIN` |
| **Resources** | `GET` | `/api/resources` | Retrieves all active (non-deleted) resources for the tenant. | `ORG_ADMIN`, `EMPLOYEE` |
| **Resources** | `GET` | `/api/resources/:id` | Retrieves detailed information for a single resource. | `ORG_ADMIN`, `EMPLOYEE` |
| **Resources** | `PATCH` | `/api/resources/:id` | Updates a resource's details (name, buffer time). | `ORG_ADMIN` |
| **Resources** | `DELETE` | `/api/resources/:id` | Soft-deletes a resource by marking it as deleted. | `ORG_ADMIN` |
| **Bookings** | `POST` | `/api/bookings` | Registers a confirmed booking for a resource after validation checks. | `ORG_ADMIN`, `EMPLOYEE` |
| **Bookings** | `GET` | `/api/bookings` | Lists bookings (Admins see all; Employees see only their own). | `ORG_ADMIN`, `EMPLOYEE` |
| **Bookings** | `PATCH` | `/api/bookings/:id/cancel` | Cancels a booking, releasing the resource slot and buffer window. | `ORG_ADMIN`, `EMPLOYEE` (Own only) |
| **Availability** | `GET` | `/api/resources/:id/availability` | Computes free reservation slots on a date, filtered by timezone & hours. | `ORG_ADMIN`, `EMPLOYEE` |
| **Availability** | `GET` | `/api/bookings/:resourceId/availability` | Alternative endpoint to query resource availability by date. | `ORG_ADMIN`, `EMPLOYEE` |
