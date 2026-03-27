import pool from '../config/db.js';

export const getProperties = async (req, res) => {
  try {
    const { property_type, listing_type, city, min_price, max_price, bedrooms, bathrooms, min_area, max_area, search, sort, page = 1, limit = 12 } = req.query;
    let query = `SELECT p.*, u.name as seller_name, u.phone as seller_phone, u.email as seller_email,
      (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM properties p JOIN users u ON p.user_id = u.id WHERE p.status = 'approved'`;
    const params = [];

    if (property_type) { query += ' AND p.property_type = ?'; params.push(property_type); }
    if (listing_type) { query += ' AND p.listing_type = ?'; params.push(listing_type); }
    if (city) { query += ' AND p.city = ?'; params.push(city); }
    if (min_price) { query += ' AND p.price >= ?'; params.push(Number(min_price)); }
    if (max_price) { query += ' AND p.price <= ?'; params.push(Number(max_price)); }
    if (bedrooms) { query += ' AND p.bedrooms >= ?'; params.push(Number(bedrooms)); }
    if (bathrooms) { query += ' AND p.bathrooms >= ?'; params.push(Number(bathrooms)); }
    if (min_area) { query += ' AND p.area >= ?'; params.push(Number(min_area)); }
    if (max_area) { query += ' AND p.area <= ?'; params.push(Number(max_area)); }
    if (search) { query += ' AND (p.title LIKE ? OR p.location LIKE ? OR p.city LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    // Count total
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Sort
    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'newest') query += ' ORDER BY p.created_at DESC';
    else if (sort === 'oldest') query += ' ORDER BY p.created_at ASC';
    else query += ' ORDER BY p.is_featured DESC, p.created_at DESC';

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await pool.query(query, params);
    res.json({
      properties: rows,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFeaturedProperties = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name as seller_name,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM properties p JOIN users u ON p.user_id = u.id
        WHERE p.status = 'approved' AND p.is_featured = 1
        ORDER BY p.created_at DESC LIMIT 6`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name as seller_name, u.phone as seller_phone, u.email as seller_email, u.avatar as seller_avatar
        FROM properties p JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    const [images] = await pool.query('SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order', [req.params.id]);
    const property = { ...rows[0], images };
    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProperty = async (req, res) => {
  try {
    const { title, description, price, property_type, listing_type, bedrooms, bathrooms, area, area_unit, location, city, district, address, latitude, longitude, features, images } = req.body;
    const [result] = await pool.query(
      `INSERT INTO properties (title, description, price, property_type, listing_type, bedrooms, bathrooms, area, area_unit, location, city, district, address, latitude, longitude, features, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, property_type, listing_type || 'buy', bedrooms || 0, bathrooms || 0, area, area_unit || 'sq.ft', location, city, district, address, latitude, longitude, JSON.stringify(features || []), req.user.id]
    );
    if (images && images.length > 0) {
      const imageValues = images.map((img, i) => [result.insertId, img, i === 0, i]);
      await pool.query('INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES ?', [imageValues]);
    }
    const [property] = await pool.query('SELECT * FROM properties WHERE id = ?', [result.insertId]);
    res.status(201).json(property[0]);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, description, price, property_type, listing_type, bedrooms, bathrooms, area, area_unit, location, city, district, address, features, images } = req.body;
    await pool.query(
      `UPDATE properties SET title=?, description=?, price=?, property_type=?, listing_type=?, bedrooms=?, bathrooms=?, area=?, area_unit=?, location=?, city=?, district=?, address=?, features=?, status='pending' WHERE id=?`,
      [title, description, price, property_type, listing_type, bedrooms, bathrooms, area, area_unit, location, city, district, address, JSON.stringify(features || []), req.params.id]
    );
    if (images && images.length > 0) {
      await pool.query('DELETE FROM property_images WHERE property_id = ?', [req.params.id]);
      const imageValues = images.map((img, i) => [req.params.id, img, i === 0, i]);
      await pool.query('INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES ?', [imageValues]);
    }
    const [property] = await pool.query('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    res.json(property[0]);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await pool.query('DELETE FROM properties WHERE id = ?', [req.params.id]);
    res.json({ message: 'Property deleted' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProperties = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
       FROM properties p WHERE p.user_id = ? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
