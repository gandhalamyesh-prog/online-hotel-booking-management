require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 3 }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) { next(err); }
});

app.use((req, res) => res.status(404).json({ message: 'The requested page or API route was not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Check the server terminal for details.' });
});

app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Connected to MySQL database: ${process.env.DB_NAME || 'yashaswini_hotel_booking'}`);
  } catch (err) {
    console.error('Server started, but MySQL connection failed:', err.message);
    console.error('Check your .env database settings and make sure MySQL is running.');
  }
});
