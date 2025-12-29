import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Helper to mimic Next.js/Vercel Request/Response if needed, 
// but Express req/res are mostly compatible with standard (req, res) handlers 
// used in this project (which use res.status().json()).

app.all('/api/*', async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        let apiPath = url.pathname.replace('/api', '');

        // Remove trailing slash if present
        if (apiPath.endsWith('/') && apiPath.length > 1) {
            apiPath = apiPath.slice(0, -1);
        }

        const basePath = path.join(process.cwd(), 'api');
        let modulePath = null;

        // Strategy 1: exact match .js
        // e.g. /api/auth/login -> api/auth/login.js
        const path1 = path.join(basePath, apiPath + '.js');

        // Strategy 2: index.js in directory
        // e.g. /api/books -> api/books/index.js
        const path2 = path.join(basePath, apiPath, 'index.js');

        if (fs.existsSync(path1)) {
            modulePath = path1;
        } else if (fs.existsSync(path2)) {
            modulePath = path2;
        }

        if (!modulePath) {
            console.warn(`API Route not found for: ${req.method} ${req.url}`);
            return res.status(404).json({ error: 'API route not found' });
        }

        // Import the handler
        // Cache busting could be added here for dev experience, but standard import is fine for now
        const module = await import(`file://${modulePath}`);

        if (typeof module.default === 'function') {
            await module.default(req, res);
        } else {
            console.error(`Module at ${modulePath} does not export a default function`);
            res.status(500).json({ error: 'Invalid API handler' });
        }

    } catch (error) {
        console.error('API Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 API Server running at http://localhost:${PORT}`);
    console.log(`   - Proxying /api requests to local handlers`);
    console.log(`   - Database URL: ${process.env.DATABASE_URL ? 'Loaded' : 'Missing'}\n`);
});
