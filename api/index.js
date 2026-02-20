// Vercel Serverless Function entry point.
// Vercel routes all /api/** requests here via vercel.json rewrites.

import mongoose from 'mongoose';
import app from '../backend/server.js';

// Cache the DB connection across warm invocations
let connectionPromise = null;

async function connectDB() {
    if (!connectionPromise) {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not set.');
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not set.');
        }
        connectionPromise = mongoose.connect(process.env.MONGO_URI);
    }
    return connectionPromise;
}

export default async function handler(req, res) {
    try {
        await connectDB();
        app(req, res);
    } catch (err) {
        console.error('[Vercel handler] Startup error:', err.message);
        res.status(500).json({ message: err.message });
    }
}
