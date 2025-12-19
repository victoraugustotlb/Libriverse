import pool from '../../lib/db.js';
import { verifyToken } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
    const user = verifyToken(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        const { q } = req.query;

        if (!q) {
            return res.status(200).json([]);
        }

        try {
            // Search for matches in title or author, case-insensitive
            // DISTINCT ON (title, author) to avoid showing duplicate books from multiple users
            const result = await pool.query(
                `SELECT id, title, author, publisher, cover_url 
                 FROM books 
                 WHERE title ILIKE $1 OR author ILIKE $1 
                 ORDER BY created_at DESC
                 LIMIT 20`,
                [`%${q}%`]
            );

            const books = result.rows.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                coverUrl: book.cover_url
            }));

            return res.status(200).json(books);

        } catch (error) {
            console.error('Search books error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
