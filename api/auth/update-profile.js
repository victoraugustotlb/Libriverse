import pool from '../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env');
}
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        const { name, newPassword, confirmPassword } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        let query = 'UPDATE users SET name = $1';
        let values = [name];
        let paramCount = 1;

        if (newPassword) {
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            paramCount++;
            query += `, password = $${paramCount}`;
            values.push(hashedPassword);
        }

        paramCount++;
        query += ` WHERE id = $${paramCount} RETURNING id, name, email`;
        values.push(userId);

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = result.rows[0];

        // Ensure we don't return password
        delete updatedUser.password;

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update Profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
