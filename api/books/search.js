import pool from '../lib/db.js';
import { verifyToken } from '../lib/auth-utils.js';

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
            // Ensure table exists just in case
            await pool.query(`
                CREATE TABLE IF NOT EXISTS books (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    publisher TEXT,
                    cover_url TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);

            // Search for matches in title or author, case-insensitive
            if (q === 'DEBUG') {
                const result = await pool.query(
                    `SELECT id, title, author, publisher, cover_url 
                    FROM books 
                    ORDER BY created_at DESC
                    LIMIT 20`
                );

                const countResult = await pool.query('SELECT COUNT(*) FROM books');
                const totalCount = countResult.rows[0].count;

                const books = result.rows.map(book => ({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    publisher: book.publisher,
                    coverUrl: book.cover_url,
                    isbn: book.isbn
                }));

                books.unshift({
                    id: 999999,
                    title: `DEBUG: Total Books in DB: ${totalCount}`,
                    author: 'System Info',
                    publisher: 'System',
                    coverUrl: ''
                });

                return res.status(200).json(books);
            }
            console.log('Searching for:', q);
            // Use DISTINCT ON to return only one instance of each book (title/author pair)
            // preventing duplicates in search results when multiple users own the same book
            const result = await pool.query(
                `SELECT DISTINCT ON (title, author) id, title, author, publisher, cover_url, isbn
                 FROM books 
                 WHERE title ILIKE $1 OR author ILIKE $1 OR isbn ILIKE $1
                 ORDER BY title, author, created_at DESC
                 LIMIT 20`,
                [`%${q}%`]
            );
            console.log('Found results:', result.rows.length);

            const books = result.rows.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                coverUrl: book.cover_url,
                isbn: book.isbn
            }));

            return res.status(200).json(books);

        } catch (error) {
            console.error('Search books error:', error);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
