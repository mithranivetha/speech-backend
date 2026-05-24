const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const app = express();

// Set up Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Transcribe route
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    console.log('File received:', req.file.originalname);
    console.log('Sending to Deepgram...');

    // Read the audio file
    const audioBuffer = fs.readFileSync(req.file.path);

    // Send to Deepgram
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true',
      audioBuffer,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/m4a',
        }
      }
    );

    const transcript = response.data.results.channels[0].alternatives[0].transcript;

    console.log('Transcription received:', transcript);

    // Save to Supabase
    const { data, error: dbError } = await supabase
      .from('transcriptions')
      .insert({
        filename: req.file.originalname,
        transcript: transcript
      })
      .select();

    if (dbError) throw dbError;

    console.log('Saved to database!');

    // Delete the uploaded file after transcribing
    fs.unlinkSync(req.file.path);

    res.json({
      transcript: transcript,
      saved: true
    });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all transcriptions route
app.get('/transcriptions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transcriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a transcription
app.delete('/transcriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('transcriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Transcription deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});