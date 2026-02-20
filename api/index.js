// Vercel Serverless Function entry point for the Express backend.
// Vercel routes all /api/** requests here via vercel.json rewrites.

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: new URL('../backend/.env', import.meta.url).pathname });

// Lazily import the app (avoids re-connecting on every cold start)
let appPromise;

async function getApp() {
    if (!appPromise) {
        appPromise = (async () => {
            const { default: app } = await import('../backend/server.js');

            // Connect to MongoDB once per container lifecycle
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(process.env.MONGO_URI);
            }

            return app;
        })();
    }
    return appPromise;
}

export default async function handler(req, res) {
    const app = await getApp();
    app(req, res);
}
