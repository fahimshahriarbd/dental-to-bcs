import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './api/fetch-sheet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// API endpoint proxy
app.get('/api/fetch-sheet', handler);
app.all('/api/fetch-sheet', handler);

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
