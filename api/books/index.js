import pool from '../lib/db.js';
import { verifyToken } from '../lib/auth-utils.js';

export default async function handler(req, res) {
    const user = verifyToken(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            // Ensure tables exist (lazy creation)
            await pool.query(`
                CREATE TABLE IF NOT EXISTS global_books (
                    id SERIAL PRIMARY KEY,
                    isbn TEXT UNIQUE,
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    publisher TEXT,
                    cover_url TEXT,
                    page_count INTEGER,
                    language TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS user_books (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    global_book_id INTEGER REFERENCES global_books(id),
                    custom_cover_url TEXT,
                    is_read BOOLEAN DEFAULT FALSE,
                    current_page INTEGER DEFAULT 0,
                    purchase_date DATE,
                    purchase_price DECIMAL(10, 2),
                    loaned_to TEXT,
                    loan_date DATE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    CONSTRAINT unique_user_book UNIQUE (user_id, global_book_id)
                );
            `);

            const result = await pool.query(
                `SELECT 
                    ub.id, ub.user_id, ub.is_read, ub.current_page, 
                    ub.purchase_date, ub.purchase_price, ub.loaned_to, ub.loan_date,
                    ub.created_at, ub.custom_cover_url, ub.global_book_id,
                    gb.title, gb.author, gb.publisher, gb.cover_url as global_cover_url,
                    gb.page_count, gb.language, gb.isbn
                 FROM user_books ub
                 JOIN global_books gb ON ub.global_book_id = gb.id
                 WHERE ub.user_id = $1 
                 ORDER BY ub.created_at DESC`,
                [user.userId]
            );

            // Map DB fields to frontend expected format
            const books = result.rows.map(book => ({
                id: book.id,
                globalId: book.global_book_id,
                title: book.title,
                author: book.author,
                publisher: book.publisher,
                coverUrl: book.custom_cover_url || book.global_cover_url, // Prefer custom cover
                createdAt: book.created_at,
                pageCount: book.page_count,
                language: book.language,
                isRead: book.is_read,
                purchaseDate: book.purchase_date,
                purchasePrice: book.purchase_price,
                loanedTo: book.loaned_to,
                loanDate: book.loan_date,
                currentPage: book.current_page,
                isbn: book.isbn
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
            loanedTo, loanDate, currentPage, isbn
        } = req.body;

        if (!title || !author) {
            return res.status(400).json({ error: 'Title and Author are required' });
        }

        try {
            // Check if exists in global_books
            let globalBookId;
            let existingGlobalBook;

            if (isbn) {
                const resIsbn = await pool.query('SELECT id FROM global_books WHERE isbn = $1', [isbn]);
                if (resIsbn.rows.length > 0) existingGlobalBook = resIsbn.rows[0];
            }

            if (!existingGlobalBook) {
                // Fallback check by title + author if no ISBN match (fuzzy constraint)
                const resTitleAuthor = await pool.query(
                    'SELECT id FROM global_books WHERE title ILIKE $1 AND author ILIKE $2',
                    [title, author]
                );
                if (resTitleAuthor.rows.length > 0) existingGlobalBook = resTitleAuthor.rows[0];
            }

            if (existingGlobalBook) {
                globalBookId = existingGlobalBook.id;
            } else {
                // Create in global_books
                const resNewGlobal = await pool.query(
                    `INSERT INTO global_books (title, author, publisher, cover_url, page_count, language, isbn)
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                    [title, author, publisher, coverUrl, pageCount || null, language || 'Português', isbn || null]
                );
                globalBookId = resNewGlobal.rows[0].id;
            }

            // Create relation in user_books
            // We save the coverUrl passed by the user as custom_cover_url if provided.
            const result = await pool.query(
                `INSERT INTO user_books (
                    user_id, global_book_id, custom_cover_url,
                    is_read, current_page,
                    purchase_date, purchase_price, loaned_to, loan_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                [
                    user.userId, globalBookId, coverUrl || null,
                    isRead || false, currentPage || 0,
                    purchaseDate || null, purchasePrice || null, loanedTo || null, loanDate || null
                ]
            );

            // Construct full response object
            const newBook = result.rows[0];
            return res.status(201).json({
                id: newBook.id, // user_book id
                title, author, publisher,
                coverUrl: newBook.custom_cover_url || coverUrl,
                pageCount, language, isbn,
                isRead: newBook.is_read,
                currentPage: newBook.current_page,
                createdAt: newBook.created_at,
                // Return new fields if needed
                purchaseDate: newBook.purchase_date,
                purchasePrice: newBook.purchase_price,
                loanedTo: newBook.loaned_to,
                loanDate: newBook.loan_date
            });

        } catch (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(409).json({ error: 'Book already in library' });
            }
            console.error('Add book error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Book ID is required' });
        }

        try {
            const result = await pool.query(
                'DELETE FROM user_books WHERE id = $1 AND user_id = $2 RETURNING *',
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
            const result = await pool.query(
                `UPDATE user_books 
                 SET current_page = COALESCE($1, current_page),
                     is_read = COALESCE($2, is_read)
                 WHERE id = $3 AND user_id = $4
                 RETURNING *`,
                [
                    currentPage !== undefined ? currentPage : null,
                    isRead !== undefined ? isRead : null,
                    id,
                    user.userId
                ]
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
