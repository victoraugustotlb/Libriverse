import pool from '../lib/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

if (!process.env.JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env');
}
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const { password } = req.body; // Require password for deletion

    if (!password) {
        return res.status(400).json({ error: 'Password is required to delete account' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        // 1. Verify password one last time
        const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        // 2. Delete User Data (Books first, then User)
        // Note: If you have foreign keys with ON DELETE CASCADE, the first query isn't strictly necessary, 
        // but it's good practice to be explicit if unsure about DB schema.
        await pool.query('DELETE FROM books WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        return res.status(200).json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.error('Delete Account error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
