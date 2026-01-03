import pool from '../lib/db.js';
import { verifyToken } from '../lib/auth-utils.js';

export default async function handler(req, res) {
    const user = verifyToken(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }



    // Ensure tables exist (Schema Initialization for all methods)
    try {
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
                edition_date TEXT,
                translator TEXT,
                synopsis TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS old_books (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                publisher TEXT,
                cover_url TEXT,
                page_count INTEGER,
                language TEXT,
                edition_date TEXT,
                translator TEXT,
                synopsis TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_books (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                global_book_id INTEGER REFERENCES global_books(id),
                old_book_id INTEGER REFERENCES old_books(id),
                custom_cover_url TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                current_page INTEGER DEFAULT 0,
                purchase_date DATE,
                purchase_price DECIMAL(10, 2),
                loaned_to TEXT,
                loan_date DATE,
                cover_type TEXT,
                start_date DATE,
                finish_date DATE,
                created_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT unique_user_book UNIQUE (user_id, global_book_id),
                CONSTRAINT check_book_source CHECK (
                    (global_book_id IS NOT NULL AND old_book_id IS NULL) OR
                    (global_book_id IS NULL AND old_book_id IS NOT NULL)
                )
            );
        `);

        // Migrations
        try {
            await pool.query(`ALTER TABLE global_books ADD COLUMN IF NOT EXISTS edition_date TEXT;`);
            await pool.query(`ALTER TABLE global_books ADD COLUMN IF NOT EXISTS translator TEXT;`);
            await pool.query(`ALTER TABLE global_books ADD COLUMN IF NOT EXISTS synopsis TEXT;`); // [NEW]

            await pool.query(`ALTER TABLE old_books ADD COLUMN IF NOT EXISTS synopsis TEXT;`); // [NEW]

            await pool.query(`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS cover_type TEXT;`);
            await pool.query(`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS start_date DATE;`);
            await pool.query(`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS finish_date DATE;`);
            await pool.query(`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS old_book_id INTEGER REFERENCES old_books(id);`);
            // We don't strictly need to recreate the constraint here every time if it might fail, 
            // but for safety we can ignore if it fails or check existence. 
            // For now, let's leave the constraint definition in CREATE TABLE.
        } catch (err) {
            console.log('Migration check:', err.message);
        }
    } catch (dbErr) {
        console.error("Database initialization error:", dbErr);
        return res.status(500).json({ error: 'Database initialization failed' });
    }

    if (req.method === 'GET') {
        try {

            const result = await pool.query(
                `SELECT 
                    ub.id, ub.user_id, ub.is_read, ub.current_page, 
                    ub.purchase_date, ub.purchase_price, ub.loaned_to, ub.loan_date,
                    ub.start_date, ub.finish_date,
                    ub.created_at, ub.custom_cover_url, ub.global_book_id, ub.old_book_id, ub.cover_type,
                    COALESCE(gb.title, ob.title) as title,
                    COALESCE(gb.author, ob.author) as author,
                    COALESCE(gb.publisher, ob.publisher) as publisher,
                    COALESCE(gb.cover_url, ob.cover_url) as global_cover_url,
                    COALESCE(gb.page_count, ob.page_count) as page_count,
                    COALESCE(gb.language, ob.language) as language,
                    gb.isbn,
                    COALESCE(gb.edition_date, ob.edition_date) as edition_date,
                    COALESCE(gb.translator, ob.translator) as translator,
                    COALESCE(gb.synopsis, ob.synopsis) as synopsis
                 FROM user_books ub
                 LEFT JOIN global_books gb ON ub.global_book_id = gb.id
                 LEFT JOIN old_books ob ON ub.old_book_id = ob.id
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
                startDate: book.start_date,
                finishDate: book.finish_date,
                currentPage: book.current_page,
                isbn: book.isbn,
                editionDate: book.edition_date,
                translator: book.translator,
                synopsis: book.synopsis, // [NEW]
                coverType: book.cover_type
            }));

            return res.status(200).json(books);

        } catch (error) {
            console.error('Fetch books error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        try {
            const {
                title, author, publisher, coverUrl,
                pageCount, language, isRead,
                purchaseDate, purchasePrice,
                loanedTo, loanDate, currentPage, isbn,
                editionDate, translator, coverType,
                startDate, finishDate, synopsis, // [NEW]
                isOldBook // Boolean flag from frontend
            } = req.body;

            if (!title || !author) {
                return res.status(400).json({ error: 'Title and Author are required' });
            }

            // Validation: ISBN is required for non-old books
            if (!isOldBook && !isbn) {
                return res.status(400).json({ error: 'ISBN validation failed: ISBN is required for modern books.' });
            }

            let globalBookId = null;
            let oldBookId = null;

            if (isOldBook) {
                // Insert into old_books (always create new for now, or could check duplicates locally)
                const resOld = await pool.query(
                    `INSERT INTO old_books (title, author, publisher, cover_url, page_count, language, edition_date, translator, synopsis)
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                    [title, author, publisher, coverUrl, pageCount || null, language || 'Português', editionDate || null, translator || null, synopsis || null]
                );
                oldBookId = resOld.rows[0].id;
            } else {
                // Standard Global Book Logic
                try {
                    // Check if exists in global_books
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
                            `INSERT INTO global_books (title, author, publisher, cover_url, page_count, language, isbn, edition_date, translator, synopsis)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                            [
                                title, author, publisher, coverUrl,
                                pageCount || null, language || 'Português', isbn || null,
                                editionDate || null, translator || null, synopsis || null
                            ]
                        );
                        globalBookId = resNewGlobal.rows[0].id;
                    }
                } catch (err) {
                    console.error("Error handling global book:", err);
                    throw err; // Re-throw to be caught by outer catch
                }
            }

            // Create relation in user_books
            // We save the coverUrl passed by the user as custom_cover_url if provided.
            const result = await pool.query(
                `INSERT INTO user_books (
                    user_id, global_book_id, old_book_id, custom_cover_url,
                    is_read, current_page,
                    purchase_date, purchase_price, loaned_to, loan_date, cover_type,
                    start_date, finish_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
                [
                    user.userId, globalBookId, oldBookId, coverUrl || null,
                    isRead || false, currentPage || 0,
                    purchaseDate || null, purchasePrice || null, loanedTo || null, loanDate || null,
                    coverType || null, startDate || new Date(), finishDate || null
                ]
            );

            // Construct full response object
            const newBook = result.rows[0];
            return res.status(201).json({
                id: newBook.id, // user_book id
                title, author, publisher,
                coverUrl: newBook.custom_cover_url || coverUrl,
                pageCount, language, isbn, editionDate, translator,
                coverType: newBook.cover_type,
                isRead: newBook.is_read,
                currentPage: newBook.current_page,
                createdAt: newBook.created_at,
                // Return new fields if needed
                purchaseDate: newBook.purchase_date,
                purchasePrice: newBook.purchase_price,
                loanedTo: newBook.loaned_to,
                loanDate: newBook.loan_date,
                startDate: newBook.start_date,
                finishDate: newBook.finish_date
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
        const { currentPage, isRead, startDate, finishDate } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Book ID is required' });
        }

        try {
            // [NEW] Fetch current state before update for Logging
            const currentBookRes = await pool.query(
                `SELECT ub.current_page, COALESCE(gb.page_count, ob.page_count) as page_count
                 FROM user_books ub
                 LEFT JOIN global_books gb ON ub.global_book_id = gb.id
                 LEFT JOIN old_books ob ON ub.old_book_id = ob.id
                 WHERE ub.id = $1 AND ub.user_id = $2`,
                [id, user.userId]
            );

            if (currentBookRes.rowCount === 0) {
                return res.status(404).json({ error: 'Book not found or unauthorized' });
            }

            const previousState = currentBookRes.rows[0];
            const previousPage = previousState.current_page || 0;
            const totalPages = previousState.page_count; // Can be null if not set

            // Perform Update
            const result = await pool.query(
                `UPDATE user_books 
                 SET current_page = COALESCE($1, current_page),
                     is_read = COALESCE($2, is_read),
                     start_date = COALESCE($3, start_date),
                     finish_date = COALESCE($4, finish_date)
                 WHERE id = $5 AND user_id = $6
                 RETURNING *`,
                [
                    currentPage !== undefined ? currentPage : null,
                    isRead !== undefined ? isRead : null,
                    startDate !== undefined ? startDate : null,
                    finishDate !== undefined ? finishDate : null,
                    id,
                    user.userId
                ]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Book not found or unauthorized' });
            }

            const book = result.rows[0];

            // [NEW] Log Generation
            if (currentPage !== undefined && currentPage !== previousPage) {
                const pagesRead = currentPage - previousPage;
                if (pagesRead !== 0) { // Log both forward and backward progress? user said "quantas páginas a mais foram lidas". Usually positive. But nice to have history.
                    let percentage = 0;
                    if (totalPages && totalPages > 0) {
                        percentage = (currentPage / totalPages) * 100;
                    }

                    await pool.query(
                        `INSERT INTO reading_logs (user_book_id, previous_page, current_page, pages_read, percentage)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [id, previousPage, currentPage, pagesRead, percentage.toFixed(2)]
                    );
                }
            }
            return res.status(200).json({
                ...book,
                currentPage: book.current_page,
                isRead: book.is_read,
                startDate: book.start_date,
                finishDate: book.finish_date
            });

        } catch (error) {
            console.error('Update book error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
