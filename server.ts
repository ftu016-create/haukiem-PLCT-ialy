import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Persistent storage location
const DATA_DIR = path.join(__dirname, 'storage');
const DATA_FILE = path.join(DATA_DIR, 'reports.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read reports
function readReports() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading reports file:', err);
  }
  return null;
}

// Helper to save reports
function writeReports(reports: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing reports file:', err);
    return false;
  }
}

// API Routes
app.get('/api/reports', (req, res) => {
  const reports = readReports();
  res.json({ reports });
});

app.post('/api/reports/sync-all', (req, res) => {
  const { reports } = req.body;
  if (!Array.isArray(reports)) {
    return res.status(400).json({ error: 'reports must be an array' });
  }
  writeReports(reports);
  res.json({ success: true, count: reports.length });
});

app.post('/api/reports/save', (req, res) => {
  const { report } = req.body;
  if (!report || !report.id) {
    return res.status(400).json({ error: 'Invalid report data' });
  }

  let currentReports = readReports() || [];
  const existingIdx = currentReports.findIndex((r: any) => r.id === report.id);
  if (existingIdx >= 0) {
    currentReports[existingIdx] = report;
  } else {
    currentReports.unshift(report);
  }

  writeReports(currentReports);
  res.json({ success: true, report });
});

app.delete('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  let currentReports = readReports() || [];
  currentReports = currentReports.filter((r: any) => r.id !== id);
  writeReports(currentReports);
  res.json({ success: true });
});

// Admin verify password
app.post('/api/auth/verify', (req, res) => {
  const { password } = req.body;
  if (password === 'ialy2026') {
    return res.json({ success: true, isAdmin: true });
  }
  return res.status(401).json({ success: false, message: 'Sai mật khẩu quản trị' });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
