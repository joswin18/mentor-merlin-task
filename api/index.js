// Vercel Serverless Function entry point.
// Vercel routes all /api/** requests here via vercel.json rewrites.

import mongoose from 'mongoose';
import app from '../backend/server.js';

// Cache the DB connection across warm invocations
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
}

export default async function handler(req, res) {
    try {
        await connectDB();
        app(req, res);
    } catch (err) {
        console.error('Handler error:', err);
        res.status(500).json({ message: 'Server initialisation failed.', error: err.message });
    }
}
