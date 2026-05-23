const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Test saving to Supabase
    const { data, error } = await supabase
      .from('transcriptions')
      .insert({ filename: 'test.mp3', transcript: 'This is a test transcription' })
      .select();

    if (error) throw error;

    res.json({ message: 'Database connection works!', data: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});