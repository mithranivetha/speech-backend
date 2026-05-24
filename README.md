# SpeechtoText Backend

The backend server for the SpeechtoText app, handling audio file uploads, transcription, and database storage.

## Tech Stack
- Node.js + Express (Server)
- Multer (File uploads)
- Deepgram API (Speech-to-Text)
- Supabase (Database)
- Render (Deployment)

## API Routes
- GET `/` - Check if server is running
- POST `/transcribe` - Upload audio file and get transcription
- GET `/transcriptions` - Get all saved transcriptions
- DELETE `/transcriptions/:id` - Delete a transcription by ID

## Environment Variables
Create a `.env` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
DEEPGRAM_API_KEY=your_deepgram_key
```