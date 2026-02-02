import pool from '../../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env');
}
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'login':
                return await handleLogin(req, res);
            case 'register':
                return await handleRegister(req, res);
            case 'delete-account':
                return await handleDeleteAccount(req, res);
            case 'forgot-password':
                return await handleForgotPassword(req, res);
            case 'reset-password':
                return await handleResetPassword(req, res);
            case 'update-profile':
                return await handleUpdateProfile(req, res);
            default:
                return res.status(404).json({ error: 'Endpoint not found' });
        }
    } catch (error) {
        console.error(`Error in auth action ${action}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleLogin(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            theme: user.theme,
            view_mode: user.view_mode,
            is_admin: user.is_admin,
            is_master: user.is_master
        }
    });
}

async function handleRegister(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email',
            [name, email, hashedPassword]
        );
        return res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'Email already exists' });
        throw error;
    }
}

async function handleDeleteAccount(req, res) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required to delete account' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Senha incorreta.' });

    await pool.query('DELETE FROM books WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    return res.status(200).json({ message: 'Account deleted successfully' });
}

async function handleForgotPassword(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
        `INSERT INTO verification_codes (email, code, expires_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (email)
         DO UPDATE SET code = $2, expires_at = $3`,
        [email, code, expiresAt]
    );

    const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Libriverse <onboarding@resend.dev>',
        to: [email],
        subject: 'Seu código de recuperação de senha - Libriverse',
        html: `
            <h1>Recuperação de Senha</h1>
            <p>Use o código abaixo para redefinir sua senha:</p>
            <h2>${code}</h2>
            <p>Este código expira em 15 minutos.</p>
            <p>Se você não solicitou isso, ignore este e-mail.</p>
        `
    });

    if (error) {
        console.error('Resend error:', error);
        return res.status(500).json({ error: 'Erro ao enviar e-mail.' });
    }

    return res.status(200).json({ message: 'Código enviado com sucesso.' });
}

async function handleResetPassword(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });

    const result = await pool.query('SELECT * FROM verification_codes WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Código inválido ou expirado.' });

    const record = result.rows[0];
    if (record.code !== code) return res.status(400).json({ error: 'Código incorreto.' });
    if (new Date() > new Date(record.expires_at)) return res.status(400).json({ error: 'Código expirado. Solicite um novo.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);

    return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
}

async function handleUpdateProfile(req, res) {
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const { name, newPassword, confirmPassword, theme, view_mode } = req.body;

    let updates = [];
    let values = [];
    let paramCount = 1;

    if (name) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (theme) { updates.push(`theme = $${paramCount++}`); values.push(theme); }
    if (view_mode) { updates.push(`view_mode = $${paramCount++}`); values.push(view_mode); }

    if (newPassword) {
        if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        updates.push(`password = $${paramCount++}`);
        values.push(hashedPassword);
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(userId);
    const query = `
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING id, name, email, theme, view_mode
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({ message: 'Profile updated successfully', user: result.rows[0] });
}
