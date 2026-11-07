const express = require('express');
const pool = require('../config/db');
const { requireCustomer } = require('../middleware/auth');
const router = express.Router();

router.post('/', requireCustomer, async (req, res, next) => {
  const { room_id, check_in_date, check_out_date } = req.body;
  if (!room_id || !check_in_date || !check_out_date || check_out_date <= check_in_date) {
    return res.status(400).json({ message: 'Choose a room and valid check-in/check-out dates.' });
  }
  const today = new Date().toISOString().slice(0, 10);
  if (check_in_date < today) return res.status(400).json({ message: 'Check-in date cannot be in the past.' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rooms] = await connection.execute(
      'SELECT room_id, price, status FROM rooms WHERE room_id = ? FOR UPDATE', [room_id]
    );
    if (!rooms.length || rooms[0].status !== 'Available') {
      await connection.rollback();
      return res.status(409).json({ message: 'This room is not currently available for booking.' });
    }
    const [conflicts] = await connection.execute(
      `SELECT booking_id FROM bookings
       WHERE room_id = ? AND status = 'Confirmed'
         AND check_in_date < ? AND check_out_date > ? FOR UPDATE`,
      [room_id, check_out_date, check_in_date]
    );
    if (conflicts.length) {
      await connection.rollback();
      return res.status(409).json({ message: 'This room is already booked for some of those dates. Please choose another room or dates.' });
    }
    const nights = Math.ceil((new Date(`${check_out_date}T00:00:00`) - new Date(`${check_in_date}T00:00:00`)) / 86400000);
    if (nights < 1) {
      await connection.rollback();
      return res.status(400).json({ message: 'The booking must be for at least one night.' });
    }
    const total = Number(rooms[0].price) * nights;
    const [result] = await connection.execute(
      `INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, total_amount, status)
       VALUES (?, ?, ?, ?, ?, 'Confirmed')`,
      [req.session.customer.customer_id, room_id, check_in_date, check_out_date, total.toFixed(2)]
    );
    await connection.commit();
    res.status(201).json({ message: 'Room booked successfully.', booking_id: result.insertId, total_amount: total.toFixed(2) });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally { connection.release(); }
});

router.patch('/:id/cancel', requireCustomer, async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      `UPDATE bookings SET status = 'Cancelled'
       WHERE booking_id = ? AND customer_id = ? AND status = 'Confirmed'`,
      [req.params.id, req.session.customer.customer_id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Active booking not found.' });
    res.json({ message: 'Reservation cancelled successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
