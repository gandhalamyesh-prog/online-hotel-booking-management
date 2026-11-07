# Yashaswini's Online Hotel Room Booking Management System

## Technologies
HTML, CSS, JavaScript, Node.js, Express.js and MySQL.

## Exact database tables
This project creates exactly these three tables and columns:
- customers: customer_id, name, email, phone, password
- rooms: room_id, room_number, room_type, price, capacity, status
- bookings: booking_id, customer_id, room_id, check_in_date, check_out_date, total_amount, status

## Setup on Windows
1. Install Node.js and MySQL Server / MySQL Workbench.
2. Open MySQL Workbench and run the complete `database.sql` script.
3. Extract this ZIP folder.
4. Open PowerShell or VS Code terminal in the extracted project folder.
5. Run: `npm install`
6. Copy `.env.example` to a new file named `.env`.
7. Edit `.env` and enter your MySQL password. Change `SESSION_SECRET` and `ADMIN_PASSWORD` too.
8. Run: `npm start`
9. Open: http://localhost:3000

## Administrator login
Use the values configured in `.env`:
- Email: `admin@yashaswinihotel.com` (unless changed)
- Password: `ChangeThisAdminPassword123!` (change this in `.env` before using)

There is no fourth admin table because the requested database design contains exactly three tables. Admin credentials are configured through environment variables.

## Customer workflow
Register -> Login -> Rooms -> Search by dates/type/guest capacity -> Book -> My Bookings -> Cancel.

## Admin workflow
Admin Login -> Dashboard -> Manage Rooms / Manage Bookings.
The admin can add, edit, and delete rooms (rooms with booking history cannot be deleted), and update booking statuses.

## Availability and booking safety
A room is considered available for a requested date range only when it has no overlapping Confirmed booking. Check-out day is treated as available for another booking. Booking creation uses a database transaction and locks the selected room row to reduce double-booking risk. The room `status` field is used for `Available` and `Maintenance`; date-specific reservations are determined from the bookings table.

## Notes
- Customer passwords are hashed using bcryptjs.
- Customer and admin pages use Express sessions.
- For a real public deployment, use HTTPS, a persistent session store, CSRF protection, rate limiting, and secure cookie settings.
- The room cards use a simple icon illustration; replace it with your own room photos if desired.
