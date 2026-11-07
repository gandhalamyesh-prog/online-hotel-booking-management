# Yashaswini Stay — Hotel Room Booking System

A simple hotel booking website built with HTML, CSS, JavaScript, Node.js, Express and MySQL.

## Features

### Customer
- Create an account using personal details.
- Log in with the email and password used during registration.
- Browse and search rooms.
- Book rooms for selected dates.
- View personal booking history and cancel confirmed bookings.

### Administrator
- Separate protected admin login.
- View dashboard totals.
- Add, edit and delete rooms.
- View customer bookings and update booking status.

## Project structure

```text
YashaswiniStay/
├── app.js
├── package.json
├── database.sql
├── .env.example
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── customerRoutes.js
│   ├── roomRoutes.js
│   ├── bookingRoutes.js
│   └── adminRoutes.js
└── public/
    ├── *.html
    ├── css/style.css
    └── js/*.js
```

## Setup (Windows PowerShell)

1. Install Node.js and MySQL.
2. Open this project folder in PowerShell.
3. Install packages:

   ```powershell
   npm install
   ```

4. Open MySQL Workbench, open `database.sql`, and execute the whole script. It creates a separate database named `yashaswini_stay_db` and sample rooms. It does not drop the previous `yashaswini_hotel_booking` database.
5. Copy `.env.example` to a new file named `.env` in the project root.
6. Open `.env` and enter your MySQL password in `DB_PASSWORD`.
7. Set a private admin email and password in `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Also replace `SESSION_SECRET` with a long random value. Do not share the `.env` file.
8. In PowerShell, start the app:

   ```powershell
   npm start
   ```

9. Open **http://localhost:3000** in your browser.

Keep the PowerShell window running while using the website. To stop the server, press `Ctrl + C` in that window.

## Customer login

There is no shared or pre-created customer username/password. A customer selects **Register**, enters their own details, and the application creates their account. The customer is automatically signed in after successful registration. Later, they log in using the same email and password.

Customer passwords are stored as bcrypt hashes, not plain text. Each customer's booking history is restricted to their own account.

## Administrator login

Admin access is separate from customer access. Use the private email and password configured in `.env`. Do not use a public/default admin password.

## Database connection check

After starting the server, open:

**http://localhost:3000/api/health**

A successful response includes:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Important

- Do not upload `.env` or `node_modules` to GitHub.
- The included Express session store is suitable for local development/class projects. A public production deployment needs HTTPS and a persistent session store, plus additional security protections.
- The previous database is not deleted. This project uses the new database name `yashaswini_stay_db` to avoid mixing it with the older database.
