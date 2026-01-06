import pool from '../../lib/db.js';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env');
}
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    let userId;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const { theme, view_mode } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let queryIndex = 1;

    if (theme !== undefined) {
        updates.push(`theme = $${queryIndex++}`);
        values.push(theme);
    }

    if (view_mode !== undefined) {
        updates.push(`view_mode = $${queryIndex++}`);
        values.push(view_mode);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    try {
        const query = `
            UPDATE users 
            SET ${updates.join(', ')} 
            WHERE id = $${queryIndex} 
            RETURNING theme, view_mode
        `;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            message: 'Preferences updated',
            preferences: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
