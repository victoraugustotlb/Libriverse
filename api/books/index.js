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

        await pool.query(`
            CREATE TABLE IF NOT EXISTS book_reports (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                isbn VARCHAR(20),
                book_title VARCHAR(255),
                issue_type VARCHAR(50),
                description TEXT,
                status VARCHAR(20) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Migrations
        try {
            await pool.query(`ALTER TABLE global_books ADD COLUMN IF NOT EXISTS edition_date TEXT;`);
            await pool.query(`ALTER TABLE global_books ADD COLUMN IF NOT EXISTS translator TEXT;`);
            await pool.query(`ALTER TABLE global_books ADD COLUMN IF NOT EXISTS synopsis TEXT;`); // [NEW]
            await pool.query(`ALTER TABLE global_books ADD COLUMN IF NOT EXISTS tags TEXT;`); // [NEW]

            await pool.query(`ALTER TABLE old_books ADD COLUMN IF NOT EXISTS synopsis TEXT;`); // [NEW]
            await pool.query(`ALTER TABLE old_books ADD COLUMN IF NOT EXISTS tags TEXT;`); // [NEW]

            await pool.query(`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS cover_type TEXT;`);
            await pool.query(`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS start_date DATE;`);
            await pool.query(`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS finish_date DATE;`);
            await pool.query(`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS old_book_id INTEGER REFERENCES old_books(id);`);
            await pool.query(`ALTER TABLE user_books ADD COLUMN IF NOT EXISTS tags TEXT;`); // [NEW] overrides global tags if not null
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
                    COALESCE(gb.synopsis, ob.synopsis) as synopsis,
                    COALESCE(ub.tags, gb.tags, ob.tags) as tags
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
                tags: book.tags ? book.tags.split(',') : [], // [NEW]
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
                type, description, issueType, // For reports
                title, author, publisher, coverUrl,
                pageCount, language, isRead,
                purchaseDate, purchasePrice,
                loanedTo, loanDate, currentPage, isbn,
                editionDate, translator, coverType,
                startDate, finishDate, synopsis, // [NEW]
                tags, // [NEW] array of strings
                isOldBook // Boolean flag from frontend
            } = req.body;

            // --- REPORT HANDLING ---
            if (type === 'report') {
                if (!description) {
                    return res.status(400).json({ error: 'Description is required for reports' });
                }
                const reportResult = await pool.query(
                    `INSERT INTO book_reports (user_id, isbn, book_title, issue_type, description)
                      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                    [user.userId, isbn || null, title || 'Unknown', issueType || 'other', description]
                );
                return res.status(201).json({ message: 'Report submitted successfully', reportId: reportResult.rows[0].id });
            }
            // -----------------------

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
                const tagsString = tags && Array.isArray(tags) ? tags.join(',') : null;
                const resOld = await pool.query(
                    `INSERT INTO old_books (title, author, publisher, cover_url, page_count, language, edition_date, translator, synopsis, tags)
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                    [title, author, publisher, coverUrl, pageCount || null, language || 'Português', editionDate || null, translator || null, synopsis || null, tagsString]
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
                        const tagsString = tags && Array.isArray(tags) ? tags.join(',') : null;
                        const resNewGlobal = await pool.query(
                            `INSERT INTO global_books (title, author, publisher, cover_url, page_count, language, isbn, edition_date, translator, synopsis, tags)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
                            [
                                title, author, publisher, coverUrl,
                                pageCount || null, language || 'Português', isbn || null,
                                editionDate || null, translator || null, synopsis || null,
                                tagsString
                            ]
                        );
                        globalBookId = resNewGlobal.rows[0].id;
                    }
                } catch (err) {
                    console.error("Error handling global book:", err);
                    throw err; // Re-throw to be caught by outer catch
                }
            }

            // Determine User Tags Logic (Override if exists and different)
            let userTags = null;
            if (!isOldBook && globalBookId) {
                // If appending to an existing global book, check if provided tags differ from global
                // Warning: We need to know the 'existingGlobalBook' tags to decide, but we might have lost it in previous block scope.
                // Re-fetching strictly for tags check is safer or we optimize above.
                // For simplicity/robustness: If the user provides tags, we just save them to user_books if they are different/new.
                // BUT, if it's a NEW global book, we just saved tags there, so user_books should likely be null to inherit.

                // Optimized approach: 
                // We don't have existingGlobalBook in scope easily here without refactoring.
                // Simpler Logic: If the user provided tags, we save them to user_books ONLY IF we didn't just create the global record.
                // If we created a new global record, the tags are there, so user_books is null.
                // If we found an existing record, we save provided tags to user_books (even if same, to allow future divergence, or we could be smarter).

                // Let's assume: If it's an existing global book, we ALWAYS save the tags to user_books to ensure the user gets exactly what they selected,
                // overriding whatever generic tags the global book might have or gain.
                // Exception: If we JUST created the global book, we effectively 'own' the global tags, so no need to duplicate in user_books.

                // We need to know if it was new.
                // Improving previous block:
                // ... refactoring previous block slightly is risky with replace_file_content.

                // Alternative:
                // Just save to user_books if provided tags is truthy.
                // If we just created the global book, we saved tags there too. So saving to user_books is redundant but harmless (override with same value).
                // To support the "First user sets global" requirement:
                // The insert logic above ALREADY saves to global_books if new.
                // So if we save to user_books now, we are satisfying "If next user changes, only changes for him".
                // Wait for logic: "First user ... saved in global. AFTER THAT, becomes like rest... next user if changes, only for him".
                // This implies:
                // User A adds Book X (Active Global). Tags saved to Global. User Book Tags = NULL (Inherit).
                // User B adds Book X (Existing Global). User B selects Tags.
                //    - If User B selects SAME tags -> User Book Tags = NULL (Inherit).
                //    - If User B selects DIFF tags -> User Book Tags = NEW TAGS.

                // Implementing this strictly:

                if (tags && Array.isArray(tags) && tags.length > 0) {
                    // Check global tags
                    const gBookRes = await pool.query('SELECT tags FROM global_books WHERE id = $1', [globalBookId]);
                    const globalTags = gBookRes.rows[0]?.tags || '';
                    const newTagsString = tags.join(',');

                    if (globalTags !== newTagsString) {
                        userTags = newTagsString;
                    }
                }
            }

            // Create relation in user_books
            // We save the coverUrl passed by the user as custom_cover_url if provided.
            const result = await pool.query(
                `INSERT INTO user_books (
                    user_id, global_book_id, old_book_id, custom_cover_url,
                    is_read, current_page,
                    purchase_date, purchase_price, loaned_to, loan_date, cover_type,
                    start_date, finish_date, tags
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
                [
                    user.userId, globalBookId, oldBookId, coverUrl || null,
                    isRead || false, currentPage || 0,
                    purchaseDate || null, purchasePrice || null, loanedTo || null, loanDate || null,
                    coverType || null, startDate || new Date(), finishDate || null,
                    userTags
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
                finishDate: newBook.finish_date,
                tags: (newBook.tags || (tags && Array.isArray(tags) ? tags.join(',') : '')).split(',').filter(Boolean)
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
