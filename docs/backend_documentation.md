# Backend Documentation

The Timesheet Backend is a Node.js Express application that provides a RESTful API for the Timesheet Flutter application. It uses PostgreSQL (Supabase) for data storage and JWT for authentication.

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [node-postgres](https://node-postgres.com/))
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/)
- **Password Hashing**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Environment Variables**: [dotenv](https://github.com/motdotla/dotenv)

## 📁 Project Structure

```text
backend/
├── src/
│   ├── middleware/      # Global and route-specific middleware (e.g., auth)
│   ├── routes/          # API route definitions (auth, activities, employees, etc.)
│   ├── db.js            # Database connection pool setup
│   ├── index.js         # Main application entry point
│   └── schema.sql       # Database schema and migrations
├── .env                 # Environment secrets (locally)
└── package.json         # Node.js dependencies and scripts
```

## 🚀 Setting Up the Backend

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**:
   - Create a PostgreSQL database (e.g., a project on [Supabase](https://supabase.com/)).
   - Run the SQL commands in `backend/src/schema.sql` using your database's SQL editor to create the necessary tables.

3. **Environment Configuration**:
   - Create a `.env` file in the `backend/` directory based on the following template:
   ```text
   PORT=3000
   DATABASE_URL=postgres://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=1d
   ```

4. **Running the Server**:
   ```bash
   npm run dev    # For development (using nodemon)
   npm start      # For production
   ```

## 🔐 Authentication

Most endpoints require a valid JWT in the `Authorization` header:
`Authorization: Bearer <your_jwt_token>`

The `authenticateToken` middleware verifies the token and attaches the user object to `req.user`.

## 📡 API Reference

### Auth Routes (`/auth`)
- `POST /register`: Create a new user account.
- `POST /login`: Authenticate and receive a JWT.
- `GET /me`: Retrieve the profile details of the currently logged-in user.

### Activities & Timesheets (`/activities` or `/timesheets`)
- `GET /`: List all timesheet entries for the current user.
- `POST /`: Create a new activity/timer entry.
- `PUT /:id`: Update an entry (e.g., stop a timer, update description).
- `DELETE /:id`: Remove a timesheet entry.

### Employee Data (`/employees`)
- `GET /`: Fetch aggregated daily logs (Check-in time, Check-out time, activity count, and specific activities) grouped by date.
- `POST /check-in`: Log the start of a workday.
- `POST /check-out`: Log the end of a workday.

### Notifications & Announcements
- `GET /notifications`: Fetch user-specific alerts.
- `PUT /notifications/:id/read`: Mark a specific notification as viewed.
- `GET /announcements`: List company-wide news and updates.

## 🗄 Database Schema Highlights

- **`users`**: Core user profiles and credentials.
- **`timesheet_entries`**: Individual work tasks with duration and metadata.
- **`daily_logs`**: Attendance tracking (arrival/departure) per user per day.
- **`breaks`**: Tracking break times within shifts.
- **`announcements`**: Broadcast messages for all users.
- **`notifications`**: Private alerts for specific users.

---

### Errors & Validation

- **400 Bad Request**: Missing mandatory fields or malformed data.
- **401 Unauthorized**: Missing or invalid `Authorization` header.
- **404 Not Found**: Resource (e.g., employee log) does not exist.
- **409 Conflict**: Trying to register an email that already exists.
- **500 Internal Server Error**: Unexpected server or database issue.
