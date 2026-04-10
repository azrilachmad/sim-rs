# RS-AI

Hospital AI Assistant — Vite + React (client) & Express.js (server)

## Setup

### Prerequisites
- Node.js 18+
- MySQL running locally

### 1. Database Setup
```bash
# Create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS rs_ai;"
```

### 2. Server Setup
```bash
cd server
cp .env.example .env  # Edit with your credentials
npm install
npm run seed          # Seed sample data
npm run dev           # Start server on :3001
```

### 3. Client Setup
```bash
cd client
npm install
npm run dev           # Start client on :5173
```

### Environment Variables (server/.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rs_ai
DB_USER=root
DB_PASS=
GEMINI_API_KEY=your_key_here
PORT=3001
CLIENT_URL=http://localhost:5173
```
