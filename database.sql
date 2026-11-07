CREATE DATABASE IF NOT EXISTS yashaswini_hotel_booking
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE yashaswini_hotel_booking;

-- Table 1: customers (exactly the requested five columns)
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Table 2: rooms (exactly the requested six columns)
CREATE TABLE IF NOT EXISTS rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available'
);

-- Table 3: bookings (exactly the requested seven columns)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Confirmed',
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id)
      REFERENCES customers(customer_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_room FOREIGN KEY (room_id)
      REFERENCES rooms(room_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT chk_booking_amount CHECK (total_amount >= 0)
);

-- Optional sample rooms. You may remove these INSERT statements if you
-- want to enter all room details from the administrator dashboard.
INSERT IGNORE INTO rooms (room_number, room_type, price, capacity, status) VALUES
('101', 'Single', 1200.00, 1, 'Available'),
('102', 'Double', 2000.00, 2, 'Available'),
('201', 'Deluxe', 3200.00, 3, 'Available'),
('202', 'Family', 4500.00, 4, 'Available'),
('301', 'Suite', 6000.00, 4, 'Available');
