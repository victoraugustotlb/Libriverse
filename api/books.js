import pool from './lib/db.js';
import { verifyToken } from './lib/auth-utils.js';

export default async function handler(req, res) {
    const user = verifyToken(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            // Ensure table exists (lazy creation for simplicity)
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

            const result = await pool.query(
                'SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC',
                [user.userId]
            );

            // Map DB fields to frontend expected format if necessary
            // Frontend expects: id, title, author, publisher, coverUrl (came from cover_url)
            const books = result.rows.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                coverUrl: book.cover_url,
                createdAt: book.created_at
            }));

            return res.status(200).json(books);

        } catch (error) {
            console.error('Fetch books error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        const { title, author, publisher, coverUrl } = req.body;

        if (!title || !author) {
            return res.status(400).json({ error: 'Title and Author are required' });
        }

        try {
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

            console.log('Adding book:', title, author);
            const result = await pool.query(
                'INSERT INTO books (user_id, title, author, publisher, cover_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [user.userId, title, author, publisher, coverUrl]
            );
            console.log('Book added, ID:', result.rows[0].id);

            const newBook = result.rows[0];
            return res.status(201).json({
                id: newBook.id,
                title: newBook.title,
                author: newBook.author,
                publisher: newBook.publisher,
                coverUrl: newBook.cover_url,
                createdAt: newBook.created_at
            });

        } catch (error) {
            console.error('Add book error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
