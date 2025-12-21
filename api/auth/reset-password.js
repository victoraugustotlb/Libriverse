import pool from '../lib/db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // 1. Verify Code
        const result = await pool.query(
            'SELECT * FROM verification_codes WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Código inválido ou expirado.' });
        }

        const record = result.rows[0];

        if (record.code !== code) {
            return res.status(400).json({ error: 'Código incorreto.' });
        }

        if (new Date() > new Date(record.expires_at)) {
            return res.status(400).json({ error: 'Código expirado. Solicite um novo.' });
        }

        // 2. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 3. Update User Password
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [hashedPassword, email]
        );

        // 4. Delete Used Code
        await pool.query(
            'DELETE FROM verification_codes WHERE email = $1',
            [email]
        );

        return res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error('Reset Password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
