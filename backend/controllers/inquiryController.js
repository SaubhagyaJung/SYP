import pool from '../config/db.js';

export const createInquiry = async (req, res) => {
  try {
    const { property_id, name, email, phone, message } = req.body;
    const [property] = await pool.query('SELECT id FROM properties WHERE id = ?', [property_id]);
    if (property.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    const [result] = await pool.query(
      'INSERT INTO inquiries (property_id, user_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?, ?)',
      [property_id, req.user ? req.user.id : null, name, email, phone, message]
    );
    res.status(201).json({ id: result.insertId, message: 'Inquiry sent successfully' });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPropertyInquiries = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, p.title as property_title FROM inquiries i
       JOIN properties p ON i.property_id = p.id
       WHERE p.user_id = ? ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Inquiry status updated' });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const replyToInquiry = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const inquiryId = req.params.id;

    // Get the inquiry to find who sent it
    const [inquiries] = await pool.query('SELECT user_id, property_id FROM inquiries WHERE id = ?', [inquiryId]);
    if (inquiries.length === 0) return res.status(404).json({ message: 'Inquiry not found' });
    
    const senderUserId = inquiries[0].user_id;
    const propertyId = inquiries[0].property_id;

    // Get property title
    const [properties] = await pool.query('SELECT title FROM properties WHERE id = ?', [propertyId]);
    const propertyTitle = properties.length > 0 ? properties[0].title : 'A property';

    // Update the inquiry status to 'replied'
    await pool.query("UPDATE inquiries SET status = 'replied' WHERE id = ?", [inquiryId]);

    // Create a notification for the sender if they are a registered user
    if (senderUserId) {
      const title = `Reply for ${propertyTitle}`;
      const message = `The host has replied: "${replyMessage}"`;
      await pool.query(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'inquiry_reply')",
        [senderUserId, title, message]
      );
    }

    res.json({ message: 'Reply sent and inquiry marked as replied' });
  } catch (error) {
    console.error('Reply to inquiry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
