import pool from '../lib/db.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // 1. Check if user exists
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            // For security, don't reveal if user exists. Just pretend success or give generic message.
            // But for UX, sometimes it's better to say. Let's send a success but not send email.
            // Or strictly: if user not found, 404? 
            // Let's go with: Only send if user exists. Verification relies on user existing.
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // 2. Generate Code
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // 3. Store in DB (Upsert)
        await pool.query(
            `INSERT INTO verification_codes (email, code, expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (email)
             DO UPDATE SET code = $2, expires_at = $3`,
            [email, code, expiresAt]
        );

        // 4. Send Email
        const { data, error } = await resend.emails.send({
            from: 'Libriverse <Do-Not-Reply@libriverse.com>', // Update this if you have a verified domain!
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

    } catch (error) {
        console.error('Forgot Password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
