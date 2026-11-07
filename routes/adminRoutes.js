const express = require('express');
const pool = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    req.session.admin = { email };
    return res.json({ message: 'Administrator login successful.' });
  }
  return res.status(401).json({ message: 'Incorrect administrator credentials.' });
});
router.post('/logout', requireAdmin, (req, res) => {
  delete req.session.admin;
  res.json({ message: 'Administrator logged out.' });
});
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const [[customers]] = await pool.query('SELECT COUNT(*) AS total FROM customers');
    const [[rooms]] = await pool.query('SELECT COUNT(*) AS total FROM rooms');
    const [[available]] = await pool.query("SELECT COUNT(*) AS total FROM rooms WHERE status = 'Available'");
    const [[bookings]] = await pool.query('SELECT COUNT(*) AS total FROM bookings');
    res.json({ customers: customers.total, rooms: rooms.total, available: available.total, bookings: bookings.total });
  } catch (err) { next(err); }
});
router.get('/rooms', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY room_id DESC');
    res.json(rows);
  } catch (err) { next(err); }
});
router.post('/rooms', requireAdmin, async (req, res, next) => {
  try {
    const { room_number, room_type, price, capacity, status = 'Available' } = req.body;
    if (!room_number || !room_type || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(capacity)) || Number(capacity) < 1 || !['Available','Maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Enter valid room details. Status must be Available or Maintenance.' });
    }
    const [result] = await pool.execute(
      'INSERT INTO rooms (room_number, room_type, price, capacity, status) VALUES (?, ?, ?, ?, ?)',
      [room_number.trim(), room_type.trim(), Number(price), Number(capacity), status]
    );
    res.status(201).json({ message: 'Room added successfully.', room_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That room number already exists.' });
    next(err);
  }
});
router.put('/rooms/:id', requireAdmin, async (req, res, next) => {
  try {
    const { room_number, room_type, price, capacity, status } = req.body;
    if (!room_number || !room_type || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(capacity)) || Number(capacity) < 1 || !['Available','Maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Enter valid room details. Status must be Available or Maintenance.' });
    }
    const [result] = await pool.execute(
      'UPDATE rooms SET room_number=?, room_type=?, price=?, capacity=?, status=? WHERE room_id=?',
      [room_number.trim(), room_type.trim(), Number(price), Number(capacity), status, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: 'Room updated successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That room number already exists.' });
    next(err);
  }
});
router.delete('/rooms/:id', requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM rooms WHERE room_id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: 'Room deleted successfully.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'This room has booking records and cannot be deleted. Change its status to Maintenance instead.' });
    next(err);
  }
});
router.get('/bookings', requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.booking_id, b.customer_id, c.name, c.email, c.phone,
              b.room_id, r.room_number, r.room_type, b.check_in_date,
              b.check_out_date, b.total_amount, b.status
       FROM bookings b JOIN customers c ON c.customer_id=b.customer_id
       JOIN rooms r ON r.room_id=b.room_id ORDER BY b.booking_id DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});
router.patch('/bookings/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Confirmed','Cancelled','Completed'].includes(status)) return res.status(400).json({ message: 'Invalid booking status.' });
    const [result] = await pool.execute('UPDATE bookings SET status=? WHERE booking_id=?', [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: 'Booking status updated.' });
  } catch (err) { next(err); }
});
module.exports = router;
