
import pool from '../../lib/db.js';
import { verifyToken } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
    // 1. Authenticate User
    const user = verifyToken(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // 2. Authorization Check (Must be Admin)
        const userRes = await pool.query('SELECT is_admin, is_master FROM users WHERE id = $1', [user.userId]);
        if (userRes.rows.length === 0) return res.status(401).json({ error: 'User not found' });

        const currentUser = userRes.rows[0];
        if (!currentUser.is_admin) {
            return res.status(403).json({ error: 'Forbidden: Admins only' });
        }

        const { action } = req.query;

        // --- GET REQ ---
        if (req.method === 'GET') {
            if (action === 'reports') {
                const reports = await pool.query(`
                    SELECT br.*, u.name as user_name, u.email as user_email 
                    FROM book_reports br
                    JOIN users u ON br.user_id = u.id
                    ORDER BY br.created_at DESC
                `);
                return res.status(200).json(reports.rows);
            }

            if (action === 'users') {
                // Only Master Admin can view user management list? Or all admins?
                // Let's allow all admins to see, but only Master to edit.
                const users = await pool.query(`
                    SELECT id, name, email, is_admin, is_master, created_at 
                    FROM users 
                    ORDER BY id ASC
                `);
                return res.status(200).json(users.rows);
            }
        }

        // --- PUT REQ ---
        if (req.method === 'PUT') {
            if (action === 'resolve-report') {
                const { reportId, status } = req.body;
                await pool.query('UPDATE book_reports SET status = $1 WHERE id = $2', [status, reportId]);
                return res.status(200).json({ message: 'Report updated' });
            }

            if (action === 'toggle-admin') {
                if (!currentUser.is_master) {
                    return res.status(403).json({ error: 'Forbidden: Only Master Admin can manage roles' });
                }
                const { targetUserId, isAdmin } = req.body;

                // Prevent removing your own master status accidentally via this basic UI
                if (targetUserId === user.userId) {
                    return res.status(400).json({ error: 'Cannot change your own role here' });
                }

                await pool.query('UPDATE users SET is_admin = $1 WHERE id = $2', [isAdmin, targetUserId]);
                return res.status(200).json({ message: 'User role updated' });
            }
        }

        return res.status(404).json({ error: 'Action not found' });

    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
