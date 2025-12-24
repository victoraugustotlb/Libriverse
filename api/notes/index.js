import pool from '../lib/db.js';
import { verifyToken } from '../lib/auth-utils.js';

export default async function handler(req, res) {
    const user = verifyToken(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Lazy initialization of notes table
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                book_id INTEGER REFERENCES global_books(id),
                chapter TEXT,
                page TEXT,
                content TEXT,
                is_general BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
    } catch (error) {
        console.error('Database initialization error:', error);
        return res.status(500).json({ error: 'Internal server error during DB init' });
    }

    if (req.method === 'GET') {
        try {
            const { bookId } = req.query;
            let query = `
                SELECT n.*, gb.title as book_title
                FROM notes n
                LEFT JOIN global_books gb ON n.book_id = gb.id
                WHERE n.user_id = $1
            `;
            const params = [user.userId];

            if (bookId) {
                query += ` AND n.book_id = $2`;
                params.push(bookId);
            }

            query += ` ORDER BY n.created_at DESC`;

            const result = await pool.query(query, params);

            const notes = result.rows.map(note => ({
                id: note.id,
                bookId: note.book_id,
                bookTitle: note.book_title,
                chapter: note.chapter,
                page: note.page,
                content: note.content,
                isGeneral: note.is_general,
                createdAt: note.created_at,
                // Format a date string for frontend if needed, or send raw timestamp
                date: new Date(note.created_at).toLocaleDateString('pt-BR')
            }));

            return res.status(200).json(notes);
        } catch (error) {
            console.error('Fetch notes error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        const { bookId, chapter, page, content, isGeneral } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'O conteúdo da anotação é obrigatório.' });
        }

        try {
            let realBookId = null;

            // If a book is selected (bookId corresponds to user_books.id from frontend)
            // We need to resolve it to global_book_id because the notes table references global_books
            if (bookId) {
                const bookCheck = await pool.query(
                    'SELECT global_book_id FROM user_books WHERE id = $1 AND user_id = $2',
                    [bookId, user.userId]
                );

                if (bookCheck.rows.length > 0) {
                    realBookId = bookCheck.rows[0].global_book_id;
                } else {
                    // If user sends a bookId they don't own or doesn't exist
                    return res.status(400).json({ error: 'Livro selecionado inválido ou não encontrado na sua biblioteca.' });
                }
            }

            const result = await pool.query(
                `INSERT INTO notes (user_id, book_id, chapter, page, content, is_general)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [
                    user.userId,
                    realBookId, // Use the resolved global_book_id
                    chapter || null,
                    page || null,
                    content,
                    isGeneral || false
                ]
            );

            const newNote = result.rows[0];
            return res.status(201).json({
                id: newNote.id,
                bookId: newNote.book_id,
                chapter: newNote.chapter,
                page: newNote.page,
                content: newNote.content,
                isGeneral: newNote.is_general,
                createdAt: newNote.created_at,
                date: new Date(newNote.created_at).toLocaleDateString('pt-BR')
            });

        } catch (error) {
            console.error('Create note error:', error);
            // Provide more specific error if possible, but keep internal details hidden
            return res.status(500).json({ error: 'Erro interno ao salvar anotação.' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Note ID is required' });
        }

        try {
            const result = await pool.query(
                'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, user.userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Note not found or unauthorized' });
            }

            return res.status(200).json({ message: 'Note deleted successfully' });

        } catch (error) {
            console.error('Delete note error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'PUT') {
        const { id } = req.query;
        const { bookId, chapter, page, content, isGeneral } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Note ID is required' });
        }

        try {
            let realBookId = null;
            if (bookId) {
                const bookCheck = await pool.query(
                    'SELECT global_book_id FROM user_books WHERE id = $1 AND user_id = $2',
                    [bookId, user.userId]
                );

                if (bookCheck.rows.length > 0) {
                    realBookId = bookCheck.rows[0].global_book_id;
                } else {
                    return res.status(400).json({ error: 'Livro selecionado inválido.' });
                }
            }

            const result = await pool.query(
                `UPDATE notes 
                 SET book_id = $1, chapter = $2, page = $3, content = $4, is_general = $5
                 WHERE id = $6 AND user_id = $7
                 RETURNING *`,
                [
                    realBookId,
                    chapter || null,
                    page || null,
                    content,
                    isGeneral || false,
                    id,
                    user.userId
                ]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Note not found or unauthorized' });
            }

            const updatedNote = result.rows[0];
            return res.status(200).json({
                ...updatedNote,
                id: updatedNote.id,
                date: new Date(updatedNote.created_at).toLocaleDateString('pt-BR')
            });

        } catch (error) {
            console.error('Update note error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
