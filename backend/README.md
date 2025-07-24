# ChristTaskLovable AI Backend

A Node.js Express backend server for the ChristTaskLovable AI application.

## Features

- Express.js server with CORS support
- Environment variable configuration
- Basic API routes
- Error handling middleware
- Health check endpoint

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   # The default port is 4242
   ```

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### GET /
Returns a welcome message and server information.

**Response:**
```json
{
  "message": "Hello World from the backend!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### GET /health
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "OK",
  "uptime": 123.456,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=4242
NODE_ENV=development

# Add your other environment variables here
# DATABASE_URL=your_database_url
# JWT_SECRET=your_jwt_secret
# STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── env.example        # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Development

The server runs on `http://localhost:4242` by default.

- **Main endpoint:** `http://localhost:4242/`
- **Health check:** `http://localhost:4242/health`

## Adding New Routes

To add new API routes, edit `server.js` and add them before the error handling middleware:

```javascript
// Example: Add a new route
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

## Error Handling

The server includes built-in error handling for:
- 404 Not Found errors
- 500 Internal Server errors
- CORS issues

## Security Notes

- Never commit your `.env` file to version control
- Use HTTPS in production
- Implement proper authentication for sensitive endpoints
- Validate and sanitize all input data 