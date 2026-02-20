import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import SelectedSlot from './models/SelectedSlot.js';
import requireAuth from './middleware/requireAuth.js';
import { buildCalendarGrid, buildMonthSchedule } from './services/scheduleGenerator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI =
  process.env.MONGO_URI;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});


app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, contactNumber, password } = req.body || {};

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      contactNumber: contactNumber || '',
      passwordHash,
    });

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.contactNumber,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.contactNumber,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


app.get('/api/slots/selected', requireAuth, async (req, res) => {
  try {
    const slots = await SelectedSlot.find({ userId: req.userId })
      .sort({ isoDate: 1 })
      .lean();
    res.json({ slots });
  } catch (err) {
    console.error('List selected slots error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.delete('/api/slots/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SelectedSlot.findOneAndDelete({ _id: id, userId: req.userId }).lean();
    if (!deleted) return res.status(404).json({ message: 'Slot not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete slot error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/slots/select', requireAuth, async (req, res) => {
  try {
    const { isoDate } = req.body || {};
    if (!isoDate || typeof isoDate !== 'string') {
      return res.status(400).json({ message: 'isoDate is required.' });
    }

    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
    if (!m) return res.status(400).json({ message: 'Invalid isoDate format.' });
    const year = Number(m[1]);
    const month = Number(m[2]);

    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid date.' });
    }

    const scheduleByIso = buildMonthSchedule(year, month);
    const scheduled = scheduleByIso.get(isoDate);
    if (!scheduled) {
      return res.status(400).json({ message: 'This date is not selectable.' });
    }

    const slotDoc = await SelectedSlot.create({
      userId: req.userId,
      isoDate,
      year,
      month,
      batchNumber: scheduled.batchNumber,
      dayNumber: scheduled.dayNumber,
      topic: scheduled.topic,
    });

    res.status(201).json({ slot: slotDoc });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Slot already selected.' });
    }
    console.error('Select slot error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/api/schedule/:year/:month', requireAuth, async (req, res) => {
  try {
    const year = Number(req.params.year);
    const month = Number(req.params.month);
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Invalid year/month.' });
    }

    const selected = await SelectedSlot.find({ userId: req.userId, year, month }).lean();
    const selectedSet = new Set(selected.map((s) => s.isoDate));

    const { cells } = buildCalendarGrid(year, month, selectedSet);

    res.json({ year, month, cells, selected });
  } catch (err) {
    console.error('Get schedule error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

