const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory User Database (Tracks user data & active sessions)
const users = {
  // Demo account for testing
  'test@example.com': {
    id: 'user_1',
    email: 'test@example.com',
    password: 'password123',
    activeSession: null
  }
};

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NovaMovies API is running' });
});

/**
 * 1. POST /api/auth/login
 * Handles authentication, single session enforcement, and session takeover
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password, deviceName, forceTakeover } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user or dynamically create for test environment
  let user = users[email];

  if (!user) {
    // Register user on the fly if not found
    user = {
      id: `user_${Date.now()}`,
      email,
      password,
      activeSession: null
    };
    users[email] = user;
  } else if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check if an active session exists on another device
  const hasActiveSession = user.activeSession && user.activeSession.sessionId;

  if (hasActiveSession && !forceTakeover) {
    // Status 409 Conflict: Active session detected, return existing device name for takeover modal
    return res.status(409).json({
      message: 'Active session detected on another device',
      currentDeviceName: user.activeSession.deviceName || 'Another Device'
    });
  }

  // Generate a new unique session identifier
  const newSessionId = crypto.randomBytes(16).toString('hex');

  // Set or overwrite active session details
  user.activeSession = {
    sessionId: newSessionId,
    deviceName: deviceName || 'Unknown Device',
    updatedAt: new Date()
  };

  return res.status(200).json({
    message: 'Login successful',
    token: `token_${user.id}_${Date.now()}`,
    sessionId: newSessionId,
    user: {
      id: user.id,
      email: user.email
    }
  });
});

/**
 * 2. GET /api/auth/validate-session
 * Checks if the requesting device holds the current active session
 */
app.get('/api/auth/validate-session', (req, res) => {
  const userId = req.query.userId;
  const sessionId = req.headers['x-session-id'];

  if (!userId || !sessionId) {
    return res.status(400).json({ active: false, message: 'Missing parameters' });
  }

  // Find user by ID
  const user = Object.values(users).find((u) => u.id === userId);

  // If user doesn't exist or session ID no longer matches (taken over by another device)
  if (!user || !user.activeSession || user.activeSession.sessionId !== sessionId) {
    return res.status(401).json({
      active: false,
      message: 'Session has been invalidated by another device'
    });
  }

  return res.status(200).json({ active: true });
});

/**
 * 3. POST /api/auth/logout
 * Clears active session on explicit user logout
 */
app.post('/api/auth/logout', (req, res) => {
  const { email } = req.body;
  if (users[email]) {
    users[email].activeSession = null;
  }
  return res.status(200).json({ message: 'Logged out successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});