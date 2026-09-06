const express = require('express');
const cors = require('cors');
const path = require('path');
const ApiError = require('./utils/ApiError');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// --- CORS -------------------------------------------------------------
// CLIENT_URL may be a comma-separated list to support previewing multiple
// deployed frontend URLs (e.g. Vercel production + preview URLs).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin header), e.g. curl/Postman.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new ApiError(403, 'Not allowed by CORS.'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check -------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: '3W Social App API is running.' });
});

// --- Routes ---------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// --- Error handling (must be last) -----------------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
