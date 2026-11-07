const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { check_in_date, check_out_date, room_type, guests } = req.query;
    const conditions = ["r.status = 'Available'"];
    const params = [];
    if (guests) { conditions.push('r.capacity >= ?'); params.push(Number(guests)); }
    if (room_type) { conditions.push('r.room_type = ?'); params.push(room_type); }
    if (check_in_date && check_out_date) {
      if (check_out_date <= check_in_date) return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
      conditions.push(`NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_id = r.room_id AND b.status = 'Confirmed'
          AND b.check_in_date < ? AND b.check_out_date > ?
      )`);
      params.push(check_out_date, check_in_date);
    }
    const [rows] = await pool.execute(
      `SELECT r.room_id, r.room_number, r.room_type, r.price, r.capacity, r.status
       FROM rooms r WHERE ${conditions.join(' AND ')} ORDER BY r.price ASC`,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT room_id, room_number, room_type, price, capacity, status FROM rooms WHERE room_id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Room not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
