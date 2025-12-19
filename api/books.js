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
                    created_at TIMESTAMP DEFAULT NOW(),
                    page_count INTEGER,
                    language TEXT,
                    is_read BOOLEAN DEFAULT FALSE,
                    purchase_date DATE,
                    purchase_price DECIMAL(10, 2),
                    loaned_to TEXT,
                    loan_date DATE,
                    current_page INTEGER DEFAULT 0
                )
            `);

            const result = await pool.query(
                'SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC',
                [user.userId]
            );

            // Map DB fields to frontend expected format
            const books = result.rows.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                coverUrl: book.cover_url,
                createdAt: book.created_at,
                pageCount: book.page_count,
                language: book.language,
                isRead: book.is_read,
                purchaseDate: book.purchase_date,
                purchasePrice: book.purchase_price,
                loanedTo: book.loaned_to,
                loanDate: book.loan_date,
                currentPage: book.current_page
            }));

            return res.status(200).json(books);

        } catch (error) {
            console.error('Fetch books error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        const {
            title, author, publisher, coverUrl,
            pageCount, language, isRead,
            purchaseDate, purchasePrice,
            loanedTo, loanDate, currentPage
        } = req.body;

        if (!title || !author) {
            return res.status(400).json({ error: 'Title and Author are required' });
        }

        try {
            // Lazy migration: Add missing columns if they don't exist
            // (In a real production app we would use a migration tool)
            const columnsToAdd = [
                'ADD COLUMN IF NOT EXISTS page_count INTEGER',
                'ADD COLUMN IF NOT EXISTS language TEXT',
                'ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE',
                'ADD COLUMN IF NOT EXISTS purchase_date DATE',
                'ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10, 2)',
                'ADD COLUMN IF NOT EXISTS loaned_to TEXT',
                'ADD COLUMN IF NOT EXISTS loan_date DATE',
                'ADD COLUMN IF NOT EXISTS current_page INTEGER DEFAULT 0'
            ];

            for (const col of columnsToAdd) {
                await pool.query(`ALTER TABLE books ${col}`).catch(() => { });
            }

            console.log('Adding book:', title, author);
            const result = await pool.query(
                `INSERT INTO books (
                    user_id, title, author, publisher, cover_url,
                    page_count, language, is_read,
                    purchase_date, purchase_price, loaned_to, loan_date,
                    current_page
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
                [
                    user.userId, title, author, publisher, coverUrl,
                    pageCount || null, language || 'Português', isRead || false,
                    purchaseDate || null, purchasePrice || null, loanedTo || null, loanDate || null,
                    currentPage || 0
                ]
            );
            console.log('Book added, ID:', result.rows[0].id);

            const newBook = result.rows[0];
            return res.status(201).json({
                id: newBook.id,
                title: newBook.title,
                author: newBook.author,
                publisher: newBook.publisher,
                coverUrl: newBook.cover_url,
                createdAt: newBook.created_at,
                // Return new fields
                pageCount: newBook.page_count,
                language: newBook.language,
                isRead: newBook.is_read,
                purchaseDate: newBook.purchase_date,
                purchasePrice: newBook.purchase_price,
                loanedTo: newBook.loaned_to,
                loanDate: newBook.loan_date,
                currentPage: newBook.current_page
            });

        } catch (error) {
            console.error('Add book error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
