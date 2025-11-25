import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'drawings.json');
const MAX_DRAWINGS = 50;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const readDrawings = async () => {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read drawings file', error);
    throw error;
  }
};

const writeDrawings = async (drawings) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(drawings, null, 2), 'utf-8');
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/drawings', async (_req, res) => {
  try {
    const drawings = await readDrawings();
    res.json({ drawings });
  } catch {
    res.status(500).json({ error: 'Не удалось загрузить рисунки' });
  }
});

app.post('/api/drawings', async (req, res) => {
  const { imageData } = req.body || {};

  if (!imageData || typeof imageData !== 'string' || imageData.length < 20) {
    return res.status(400).json({ error: 'Поле imageData обязательно' });
  }

  try {
    const drawings = await readDrawings();
    const entry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      imageData,
    };

    const updated = [entry, ...drawings].slice(0, MAX_DRAWINGS);
    await writeDrawings(updated);

    res.status(201).json(entry);
  } catch (error) {
    console.error('Failed to save drawing', error);
    res.status(500).json({ error: 'Не удалось сохранить рисунок' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
