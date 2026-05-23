const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// Allow frontend to talk to backend
app.use(cors());
app.use(express.json());

// Set up file upload handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Test route - just to confirm server works
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Upload route - receives audio files
app.post('/transcribe', upload.single('audio'), (req, res) => {
  console.log('File received:', req.file);
  res.json({ message: 'File received successfully!' });
});

// Start the server
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});