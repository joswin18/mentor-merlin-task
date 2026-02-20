# Mentor Merlin Task

A full-stack scheduling application with React frontend and Express backend. Users can sign up, log in, and select class slots from a monthly calendar.

## Tech Stack

- **Frontend:** React 19, React Router, Vite, Tailwind CSS, React Icons
- **Backend:** Express.js, MongoDB (Mongoose), JWT authentication, bcryptjs
- **Database:** MongoDB Atlas

## Prerequisites

- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB instance)
- Git

## Project Structure

```
.
├── src/                          # Frontend React app
│   ├── pages/                    # Page components (Login, SignUp, Schedule, etc.)
│   ├── components/               # Reusable components
│   ├── styles/                   # CSS files
│   ├── utils/                    # API client (apiFetch)
│   └── App.jsx
├── backend/                      # Express backend
│   ├── models/                   # MongoDB schemas (User, SelectedSlot)
│   ├── middleware/               # Auth middleware
│   ├── services/                 # Business logic (schedule generation)
│   ├── server.js                 # Dev server entry
│   ├── app.js                    # Express app (optional, for serverless)
│   ├── api/
│   │   └── index.js              # Vercel serverless wrapper (optional)
│   └── .env.example              # Env template
├── public/                       # Static assets
├── .env.example                  # Frontend env template
├── vercel.json                   # Vercel deployment config (optional)
└── package.json
```

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/joswin18/mentor-merlin-task.git
cd mentor-merlin-task

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Setup Environment Variables

#### Frontend (.env)

Copy the example and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# .env (frontend)
VITE_API_URL=http://localhost:4000
```

**For production (Vercel):**
```env
VITE_API_URL=https://your-deployed-app.vercel.app
```

#### Backend (.env)

Copy the example and configure:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# backend/.env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-here
```

**How to get MONGO_URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database user
3. Click "Connect" → "Drivers" → copy the connection string
4. Replace `<password>` and `<username>` with your credentials

### 3. Run Locally

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:4000`

**Terminal 2 - Frontend:**

```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

### 4. Access the App

- Open browser: `http://localhost:5173`
- Sign up or log in
- Select class slots from the calendar
- Submit selection

## Available Scripts

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production (dist/)
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend

```bash
cd backend
npm run dev      # Start with Nodemon (auto-reload)
npm start        # Start production server
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/schedule/:year/:month` | ✅ | Get calendar for month |
| POST | `/api/slots/select` | ✅ | Select a slot |
| DELETE | `/api/slots/:id` | ✅ | Delete a selected slot |
| GET | `/api/slots/selected` | ✅ | Get user's selected slots |

## Deployment

### Vercel (Recommended)

#### Option 1: Serverless Backend (Backend as Vercel Functions)

1. **Install serverless-http:**
   ```bash
   cd backend
   npm install serverless-http
   ```

2. **Update Vercel environment variables** in Project Settings:
   - `MONGO_URI` (MongoDB Atlas connection)
   - `JWT_SECRET` (random secret key)
   - `CLIENT_ORIGIN` (your Vercel app URL: https://your-app.vercel.app)
   - `VITE_API_URL` (same as CLIENT_ORIGIN)

3. **Deploy via Vercel CLI or GitHub:**
   ```bash
   npm install -g vercel
   vercel
   ```

#### Option 2: Separate Backend Hosting

Deploy backend to Render, Heroku, or Cloud Run, then set:
```env
VITE_API_URL=https://your-backend-url.com
```

## Security Notes

- **Never commit `.env` files** — use `.env.example` as a template
- Rotate credentials if exposed (especially `MONGO_URI` and `JWT_SECRET`)
- CORS is restricted to `CLIENT_ORIGIN` only
- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days

## Troubleshooting

### Login returns 404

- Verify backend is running: `http://localhost:4000/api/health` should return `{"status":"ok"}`
- Check `VITE_API_URL` in frontend `.env` matches backend URL
- Confirm `CLIENT_ORIGIN` in backend `.env` matches frontend URL (for CORS)

### MongoDB connection error

- Verify `MONGO_URI` is correct and includes credentials
- Ensure MongoDB Atlas IP whitelist allows your IP (or use 0.0.0.0/0 for dev)
- Test connection: `mongosh "your-connection-string"`

### Port already in use

- Change `PORT` in `backend/.env` (default: 4000)
- Or kill existing process: `lsof -ti:4000 | xargs kill -9` (macOS/Linux)

## Development Notes

- Frontend uses Vite for fast HMR (hot module reload)
- Backend uses Nodemon for auto-restart on file changes
- All API requests use the shared `apiFetch` utility (see `src/utils/api.js`)
- JWT token stored in localStorage after login

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "Add my feature"`
3. Push: `git push origin feature/my-feature`
4. Open a Pull Request

## License

MIT
