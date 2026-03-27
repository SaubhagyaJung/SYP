import pool from '../config/db.js';

export const toggleFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [req.user.id, propertyId]
    );
    if (existing.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id = ? AND property_id = ?', [req.user.id, propertyId]);
      res.json({ message: 'Removed from favorites', favorited: false });
    } else {
      await pool.query('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)', [req.user.id, propertyId]);
      res.json({ message: 'Added to favorites', favorited: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, f.created_at as favorited_at,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
       FROM favorites f JOIN properties p ON f.property_id = p.id
       WHERE f.user_id = ? ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
      [req.user.id, req.params.propertyId]
    );
    res.json({ favorited: rows.length > 0 });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
