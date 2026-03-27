import pool from '../config/db.js';

export const getStats = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [properties] = await pool.query('SELECT COUNT(*) as count FROM properties');
    const [approved] = await pool.query("SELECT COUNT(*) as count FROM properties WHERE status = 'approved'");
    const [pending] = await pool.query("SELECT COUNT(*) as count FROM properties WHERE status = 'pending'");
    const [inquiries] = await pool.query('SELECT COUNT(*) as count FROM inquiries');
    const [featured] = await pool.query('SELECT COUNT(*) as count FROM properties WHERE is_featured = 1');
    res.json({
      totalUsers: users[0].count,
      totalProperties: properties[0].count,
      approvedProperties: approved[0].count,
      pendingProperties: pending[0].count,
      totalInquiries: inquiries[0].count,
      featuredProperties: featured[0].count,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name as seller_name, u.email as seller_email,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
       FROM properties p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE properties SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Property status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleFeatured = async (req, res) => {
  try {
    const [property] = await pool.query('SELECT is_featured FROM properties WHERE id = ?', [req.params.id]);
    if (property.length === 0) return res.status(404).json({ message: 'Property not found' });
    const newFeatured = !property[0].is_featured;
    await pool.query('UPDATE properties SET is_featured = ? WHERE id = ?', [newFeatured, req.params.id]);
    res.json({ message: `Property ${newFeatured ? 'featured' : 'unfeatured'}`, is_featured: newFeatured });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllInquiries = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, p.title as property_title, p.city as property_city
       FROM inquiries i JOIN properties p ON i.property_id = p.id ORDER BY i.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ? AND role != ?', [req.params.id, 'admin']);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const adminDeleteProperty = async (req, res) => {
  try {
    await pool.query('DELETE FROM properties WHERE id = ?', [req.params.id]);
    res.json({ message: 'Property deleted' });
  } catch (error) {
    console.error('Admin delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Inquiry status updated', status });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ===== REVIEWS MANAGEMENT =====
export const getAllReviews = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createReview = async (req, res) => {
  try {
    const { author, role, text, rating } = req.body;
    const [result] = await pool.query(
      'INSERT INTO reviews (author, role, text, rating) VALUES (?, ?, ?, ?)',
      [author, role || '', text, rating || 5]
    );
    const [newReview] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(newReview[0]);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { author, role, text, rating } = req.body;
    await pool.query(
      'UPDATE reviews SET author = ?, role = ?, text = ?, rating = ? WHERE id = ?',
      [author, role, text, rating, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleReviewActive = async (req, res) => {
  try {
    const [review] = await pool.query('SELECT is_active FROM reviews WHERE id = ?', [req.params.id]);
    if (review.length === 0) return res.status(404).json({ message: 'Review not found' });
    const newActive = !review[0].is_active;
    await pool.query('UPDATE reviews SET is_active = ? WHERE id = ?', [newActive, req.params.id]);
    res.json({ message: `Review ${newActive ? 'activated' : 'deactivated'}`, is_active: newActive });
  } catch (error) {
    console.error('Toggle review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
