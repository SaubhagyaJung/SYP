-- JKB Nepal — MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS jkb_nepal;
USE jkb_nepal;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar VARCHAR(500),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15, 2) NOT NULL,
  property_type ENUM('house', 'apartment', 'land', 'commercial', 'office', 'rental') NOT NULL,
  listing_type ENUM('buy', 'rent') NOT NULL DEFAULT 'buy',
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  area DECIMAL(10, 2),
  area_unit VARCHAR(20) DEFAULT 'sq.ft',
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  features JSON,
  is_featured BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_property_type (property_type),
  INDEX idx_listing_type (listing_type),
  INDEX idx_city (city),
  INDEX idx_status (status),
  INDEX idx_is_featured (is_featured),
  INDEX idx_price (price)
);

-- ============================================================
-- PROPERTY IMAGES
-- ============================================================
CREATE TABLE property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- ============================================================
-- INQUIRIES
-- ============================================================
CREATE TABLE inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, property_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED: Admin User (password: admin123)
-- ============================================================
INSERT INTO users (name, email, password, phone, role) VALUES
('JKB Admin', 'admin@jkbnepal.com', '$2a$10$8K1p/a0dR1xqM8k.8Qo6aOeFT3Q0Gf7GfQ1xL6p5Yn5u6LQxKEOy', '9801234567', 'admin'),
('Ram Sharma', 'ram@example.com', '$2a$10$8K1p/a0dR1xqM8k.8Qo6aOeFT3Q0Gf7GfQ1xL6p5Yn5u6LQxKEOy', '9841234567', 'user'),
('Sita Thapa', 'sita@example.com', '$2a$10$8K1p/a0dR1xqM8k.8Qo6aOeFT3Q0Gf7GfQ1xL6p5Yn5u6LQxKEOy', '9851234567', 'user');

-- ============================================================
-- SEED: Properties
-- ============================================================
INSERT INTO properties (title, description, price, property_type, listing_type, bedrooms, bathrooms, area, area_unit, location, city, district, address, features, is_featured, status, user_id) VALUES
('Modern Villa with Roof Garden', 'Luxurious 4BHK villa with panoramic mountain views, modern architecture, and a private roof garden. Located in the premium neighborhood of Budhanilkantha.', 24500000.00, 'house', 'buy', 4, 3, 3200, 'sq.ft', 'Budhanilkantha', 'Kathmandu', 'Kathmandu', 'Budhanilkantha-6, Kathmandu', '["Parking", "Garden", "CCTV", "Modular Kitchen", "Solar Water Heater"]', TRUE, 'approved', 2),

('Contemporary House near Patan Durbar', 'A beautifully designed contemporary home minutes from Patan Durbar Square. Features exposed brick accents and hardwood floors.', 18500000.00, 'house', 'buy', 3, 2, 2400, 'sq.ft', 'Patan', 'Lalitpur', 'Lalitpur', 'Mangalbazar, Lalitpur', '["Parking", "Balcony", "Earthquake Resistant", "Water Tank"]', TRUE, 'approved', 2),

('Apartment in Civil Mall Area', 'Premium 3BHK apartment with city views, 24-hour security, elevator access, and backup power. Walking distance to Civil Mall and major hospitals.', 8500000.00, 'apartment', 'buy', 3, 2, 1450, 'sq.ft', 'Sundhara', 'Kathmandu', 'Kathmandu', 'New Road, Sundhara', '["Elevator", "Security", "Backup Generator", "Parking"]', TRUE, 'approved', 3),

('Residential Land — River Access', 'Flat, east-facing land plot ideal for building. Direct access to a river and surrounded by greenery. Clear title, immediate transfer.', 3200000.00, 'land', 'buy', 0, 0, 8, 'aana', 'Lubhu', 'Lalitpur', 'Lalitpur', 'Lubhu, Lalitpur', '["Road Access", "Electricity", "Water Supply"]', FALSE, 'approved', 2),

('Office Space — Durbar Marg', 'Premium commercial office on the 5th floor of a modern building in Durbar Marg. Glass facade, high-speed internet, and furnished.', 12000000.00, 'office', 'buy', 0, 1, 1800, 'sq.ft', 'Durbar Marg', 'Kathmandu', 'Kathmandu', 'Durbar Marg, Kathmandu', '["Furnished", "Internet", "Elevator", "AC", "Conference Room"]', FALSE, 'approved', 3),

('Lakeside Rental — Pokhara', 'Fully furnished 2BHK apartment with stunning lake and mountain views. Perfect for expats or tourists. Available for long-term rent.', 45000.00, 'rental', 'rent', 2, 1, 950, 'sq.ft', 'Lakeside', 'Pokhara', 'Kaski', 'Lakeside Marg, Pokhara', '["Furnished", "Lake View", "Mountain View", "WiFi", "Hot Water"]', TRUE, 'approved', 2),

('Commercial Building — Chitwan', 'Multi-floor commercial building on the highway. Ideal for showroom, hotel, or institutional use. High traffic location.', 52000000.00, 'commercial', 'buy', 0, 4, 5600, 'sq.ft', 'Bharatpur', 'Chitwan', 'Chitwan', 'Highway Road, Bharatpur', '["Highway Access", "Parking", "Loading Dock", "Generator"]', FALSE, 'approved', 3),

('Luxury Apartment — Jhamsikhel', 'Ultra-premium penthouse apartment in Jhamsikhel with rooftop pool access, gym, and panoramic city views. Smart home features throughout.', 35000000.00, 'apartment', 'buy', 4, 3, 2800, 'sq.ft', 'Jhamsikhel', 'Lalitpur', 'Lalitpur', 'Jhamsikhel, Lalitpur', '["Pool", "Gym", "Smart Home", "Concierge", "Parking", "CCTV"]', TRUE, 'approved', 2),

('2BHK Flat — Dharan', 'Well-maintained 2BHK flat in the heart of Dharan with market access, school proximity, and serene neighborhood.', 4200000.00, 'apartment', 'buy', 2, 1, 980, 'sq.ft', 'Dharan', 'Dharan', 'Sunsari', 'Dharan-8, Sunsari', '["Parking", "Water Tank", "Balcony"]', FALSE, 'approved', 3),

('Land Plot — Butwal', 'Strategically located land in Butwal, suitable for residential or commercial development. All utilities available.', 5600000.00, 'land', 'buy', 0, 0, 5, 'aana', 'Butwal', 'Butwal', 'Rupandehi', 'Butwal-11, Rupandehi', '["Road Access", "Electricity", "Drainage"]', FALSE, 'approved', 2),

('Studio Apartment Rental — Thamel', 'Compact, modern studio in Thamel area. Fully furnished with kitchenette. Ideal for solo expats or students.', 25000.00, 'rental', 'rent', 1, 1, 450, 'sq.ft', 'Thamel', 'Kathmandu', 'Kathmandu', 'Thamel, Kathmandu', '["Furnished", "WiFi", "Hot Water", "Security"]', FALSE, 'approved', 3),

('Premium Bungalow — Bhaktapur', 'Traditionally styled bungalow with modern interiors in historic Bhaktapur. Courtyard, traditional woodwork, and peaceful surroundings.', 28000000.00, 'house', 'buy', 5, 3, 3800, 'sq.ft', 'Bhaktapur', 'Bhaktapur', 'Bhaktapur', 'Suryabinayak, Bhaktapur', '["Courtyard", "Garden", "Traditional Architecture", "Parking", "CCTV"]', TRUE, 'approved', 2);

-- ============================================================
-- SEED: Property Images
-- ============================================================
INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES
(1, '/api/placeholder/800/600', TRUE, 0),
(2, '/api/placeholder/800/600', TRUE, 0),
(3, '/api/placeholder/800/600', TRUE, 0),
(4, '/api/placeholder/800/600', TRUE, 0),
(5, '/api/placeholder/800/600', TRUE, 0),
(6, '/api/placeholder/800/600', TRUE, 0),
(7, '/api/placeholder/800/600', TRUE, 0),
(8, '/api/placeholder/800/600', TRUE, 0),
(9, '/api/placeholder/800/600', TRUE, 0),
(10, '/api/placeholder/800/600', TRUE, 0),
(11, '/api/placeholder/800/600', TRUE, 0),
(12, '/api/placeholder/800/600', TRUE, 0);

-- ============================================================
-- SEED: Inquiries
-- ============================================================
INSERT INTO inquiries (property_id, user_id, name, email, phone, message, status) VALUES
(1, 3, 'Sita Thapa', 'sita@example.com', '9851234567', 'I am interested in this villa. Can I schedule a visit this weekend?', 'new'),
(3, 3, 'Sita Thapa', 'sita@example.com', '9851234567', 'Is the price negotiable? I would like to know about EMI options.', 'read'),
(8, 2, 'Ram Sharma', 'ram@example.com', '9841234567', 'Looking for a premium apartment. Is this one still available?', 'new');

-- ============================================================
-- SEED: Favorites
-- ============================================================
INSERT INTO favorites (user_id, property_id) VALUES
(2, 3), (2, 6), (2, 8),
(3, 1), (3, 8), (3, 12);
