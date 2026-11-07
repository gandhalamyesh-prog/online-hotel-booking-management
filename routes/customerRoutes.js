const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { requireCustomer } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return res.status(400).json({ message: 'Please complete all fields.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), phone.trim(), hash]
    );
    req.session.customer = {
      customer_id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase()
    };
    res.status(201).json({ message: 'Registration successful.', customer: req.session.customer });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That email address is already registered.' });
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Enter your email and password.' });
    const [rows] = await pool.execute(
      'SELECT customer_id, name, email, password FROM customers WHERE email = ?',
      [email.trim().toLowerCase()]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    req.session.customer = {
      customer_id: rows[0].customer_id,
      name: rows[0].name,
      email: rows[0].email
    };
    res.json({ message: 'Login successful.', customer: req.session.customer });
  } catch (err) { next(err); }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out successfully.' }));
});

router.get('/me', requireCustomer, (req, res) => res.json({ customer: req.session.customer }));

router.get('/my-bookings', requireCustomer, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.booking_id, b.room_id, r.room_number, r.room_type, r.price,
              b.check_in_date, b.check_out_date, b.total_amount, b.status
       FROM bookings b JOIN rooms r ON r.room_id = b.room_id
       WHERE b.customer_id = ? ORDER BY b.booking_id DESC`,
      [req.session.customer.customer_id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
