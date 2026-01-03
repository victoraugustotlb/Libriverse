import pool from '../../lib/db.js';
import { verifyToken } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
    const user = verifyToken(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        const { bookId } = req.query;

        if (!bookId) {
            return res.status(400).json({ error: 'Book ID is required' });
        }

        try {
            // Verify ownership
            const checkOwner = await pool.query(
                'SELECT id FROM user_books WHERE id = $1 AND user_id = $2',
                [bookId, user.userId]
            );

            if (checkOwner.rowCount === 0) {
                return res.status(404).json({ error: 'Book not found or unauthorized' });
            }

            const result = await pool.query(
                `SELECT previous_page, current_page, pages_read, percentage, created_at
                 FROM reading_logs
                 WHERE user_book_id = $1
                 ORDER BY created_at DESC`,
                [bookId]
            );

            // Format logs for frontend
            const logs = result.rows.map(log => ({
                id: log.created_at, // Use timestamp as ID
                previousPage: log.previous_page,
                currentPage: log.current_page,
                pagesRead: log.pages_read,
                percentage: log.percentage,
                date: log.created_at
            }));

            return res.status(200).json(logs);

        } catch (error) {
            console.error('Fetch logs error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
