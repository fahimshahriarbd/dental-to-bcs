import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.static(__dirname));

// Safe proxy endpoint for external Google Sheets with tab support and graceful fallback
app.get('/api/fetch-sheet', async (req, res) => {
  let targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  const sheetTab = req.query.sheet ? `&sheet=${encodeURIComponent(req.query.sheet)}` : '';

  // Auto-convert standard Google Sheets sharing/edit links to CSV export URL
  const sheetMatch = targetUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetMatch && !targetUrl.includes('gviz') && !targetUrl.includes('export')) {
    const sheetId = sheetMatch[1];
    const gidMatch = targetUrl.match(/gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    targetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}${sheetTab}`;
  } else if (req.query.sheet && !targetUrl.includes('sheet=')) {
    const joinChar = targetUrl.includes('?') ? '&' : '?';
    targetUrl = `${targetUrl}${joinChar}sheet=${encodeURIComponent(req.query.sheet)}`;
  }

  let isClientDisconnected = false;
  req.on('close', () => {
    isClientDisconnected = true;
  });

  try {
    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': 'BDS-to-BCS-Study-App/1.0',
        'Accept': 'application/json, text/csv, text/plain, */*'
      }
    });

    if (isClientDisconnected || res.headersSent) return;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    } else {
      const text = await response.text();
      return res.send(text);
    }
  } catch (err) {
    if (isClientDisconnected || res.headersSent) return;
    return res.status(200).json([]);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
