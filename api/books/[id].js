import pool from '../lib/db.js';
import { verifyToken } from '../lib/auth-utils.js';

export default async function handler(req, res) {
    const user = verifyToken(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Book ID is required' });
        }

        try {
            const result = await pool.query(
                'DELETE FROM books WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, user.userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Book not found or unauthorized' });
            }

            return res.status(200).json({ message: 'Book deleted successfully' });

        } catch (error) {
            console.error('Delete book error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'PUT') {
        const { id } = req.query;
        const { currentPage, isRead } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Book ID is required' });
        }

        try {
            // Build dynamic update query
            // For now only supporting currentPage and isRead updates
            const result = await pool.query(
                `UPDATE books 
                 SET current_page = COALESCE($1, current_page),
                     is_read = COALESCE($2, is_read)
                 WHERE id = $3 AND user_id = $4
                 RETURNING *`,
                [currentPage, isRead, id, user.userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Book not found or unauthorized' });
            }

            const book = result.rows[0];
            return res.status(200).json({
                ...book,
                currentPage: book.current_page,
                isRead: book.is_read
            });

        } catch (error) {
            console.error('Update book error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
