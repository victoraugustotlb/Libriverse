import pool from '../lib/db.js';
import { verifyToken } from '../lib/auth-utils.js';

export default async function handler(req, res) {
    const user = verifyToken(req);

    if (!user || !user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    if (req.method === 'GET') {
        try {
            // Fetch all global books
            const globalBooks = await pool.query('SELECT *, \'global\' as type FROM global_books ORDER BY created_at DESC');

            // Fetch all old books
            const oldBooks = await pool.query('SELECT *, \'old\' as type FROM old_books ORDER BY created_at DESC');

            const allBooks = [...globalBooks.rows, ...oldBooks.rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return res.status(200).json(allBooks);
        } catch (error) {
            console.error('Admin fetch books error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'PUT') {
        const { id, type, title, author, publisher, cover_url, page_count, language, isbn, edition_date, translator } = req.body;

        if (!id || !type) {
            return res.status(400).json({ error: 'Book ID and Type are required' });
        }

        try {
            let result;
            if (type === 'global') {
                result = await pool.query(
                    `UPDATE global_books 
                     SET title = $1, author = $2, publisher = $3, cover_url = $4, page_count = $5, language = $6, isbn = $7, edition_date = $8, translator = $9
                     WHERE id = $10 RETURNING *, 'global' as type`,
                    [title, author, publisher, cover_url, page_count, language, isbn, edition_date, translator, id]
                );
            } else if (type === 'old') {
                result = await pool.query(
                    `UPDATE old_books 
                     SET title = $1, author = $2, publisher = $3, cover_url = $4, page_count = $5, language = $6, edition_date = $7, translator = $8
                     WHERE id = $9 RETURNING *, 'old' as type`,
                    [title, author, publisher, cover_url, page_count, language, edition_date, translator, id]
                );
            } else {
                return res.status(400).json({ error: 'Invalid book type' });
            }

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }

            return res.status(200).json(result.rows[0]);

        } catch (error) {
            console.error('Admin update book error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
