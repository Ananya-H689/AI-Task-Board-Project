const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_task_board';

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: '' }
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: String,
  assignee: String,
  priority: String,
  done: Boolean,
  starred: Boolean,
  createdAt: String,
  completedAt: String
}, { _id: false });

const StateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  transcriptHistory: [
    {
      transcript: String,
      meetingIdentity: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  tasks: [TaskSchema],
  doneTasks: [TaskSchema],
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const TaskState = mongoose.model('TaskState', StateSchema);

function clean(v) { return String(v || '').trim(); }
function arr(v) { return Array.isArray(v) ? v : []; }
function isValidTask(t) { return t && t.text && t.assignee && t.text.trim().length > 2 && t.assignee.trim().length > 0; }

function dedupeTasks(tasks) {
  const seen = new Set();
  const out = [];
  for (const t of tasks) {
    const key = `${String(t.assignee || '').toLowerCase()}|${String(t.text || '').toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

async function ensureState(userId) {
  return await TaskState.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        transcriptHistory: [],
        tasks: [],
        doneTasks: []
      }
    },
    { upsert: true, new: true }
  );
}

function splitActions(text) {
  return String(text || '')
    .split(/\b(?:and also|and then|and|also|then|,|;)\b/i)
    .map(s => s.trim())
    .filter(Boolean);
}

function normalizeSentence(s) {
  return String(s || '').replace(/[“”]/g, '"').replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
}

function isNoise(sentence) {
  const t = normalizeSentence(sentence).toLowerCase();
  if (!t || t.length < 4) return true;
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|ok|okay|alright|thanks|thank you|lets focus|let's focus|moving on|next point)$/.test(t)) return true;
  if (/^(alright guys|okay guys|guys let'?s|guys let's|so today|today we|let's start)$/i.test(t)) return true;
  return false;
}

function classifyPriority(text) {
  const t = String(text || '').toLowerCase();
  if (/(fix|bug|error|crash|broken|urgent|asap|critical|security|login)/.test(t)) return 'high';
  if (/(review|check|verify|test|validate|update|look into)/.test(t)) return 'medium';
  return 'low';
}

function simplifyTaskText(text) {
  let t = String(text || '').trim();
  t = t.replace(/^(please|kindly|you should probably|you should|you need to|you have to|probably|maybe|just|actually|basically)\s+/i, '');
  t = t.replace(/\b(should|will|needs to|need to|must|can you|could you)\b/gi, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

const KNOWN_NAMES = new Set([
  'rahul', 'priya', 'aman', 'neha', 'karan', 'asha', 'vikram', 'meena', 'arjun', 'sana'
]);

function findAssignee(sentence) {
  const words = String(sentence || '').match(/\b[A-Z][a-z]{2,20}\b/g) || [];
  for (const w of words) {
    const lw = w.toLowerCase();
    if (KNOWN_NAMES.has(lw)) return w;
  }
  for (const w of words) {
    const lw = w.toLowerCase();
    if (!['good', 'morning', 'thanks', 'today', 'meeting', 'project', 'login', 'javascript'].includes(lw)) {
      return w;
    }
  }
  return 'Unassigned';
}

function extractTasksFromSentence(sentence) {
  const s = normalizeSentence(sentence);
  if (isNoise(s)) return [];

  const lower = s.toLowerCase();
  const actionRegex = /\b(fix|update|review|prepare|send|check|debug|create|build|test|write|deploy|analyze|design|implement|handle|resolve|complete|submit|add|remove|refactor|document|setup|configure|integrate|merge|push|pull|schedule|plan|follow up|coordinate|verify|validate|investigate|research|optimize|improve|migrate|backup|monitor|present|share|upload|download|install|connect|call|email|message|notify|inform|ensure|look into|work on|finish|start|begin|make)\b/i;

  const actionMatch = s.match(actionRegex);
  if (!actionMatch) return [];

  const assignee = findAssignee(s);
  const actionIndex = lower.indexOf(actionMatch[0].toLowerCase());
  let candidate = simplifyTaskText(s.slice(actionIndex));
  if (!candidate) return [];

  const parts = splitActions(candidate);
  const out = [];

  for (const p of parts) {
    const cleaned = simplifyTaskText(p);
    if (!cleaned || cleaned.length < 3) continue;
    out.push({
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: cleaned,
      assignee,
      priority: classifyPriority(cleaned),
      done: /(done|completed|submitted|finished|resolved|closed)/i.test(cleaned),
      starred: false,
      createdAt: new Date().toISOString(),
      completedAt: ''
    });
  }

  return out;
}

function parseTranscript(transcript) {
  const sentences = String(transcript || '').split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const tasks = [];
  for (const sentence of sentences) {
    const extracted = extractTasksFromSentence(sentence);
    for (const task of extracted) if (isValidTask(task)) tasks.push(task);
  }
  return dedupeTasks(tasks);
}

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'API running' });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'healthy' });
});

app.post('/register', async (req, res) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email).toLowerCase();
    const password = clean(req.body.password);
    const role = clean(req.body.role);

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered. Please login.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });

    await ensureState(user._id);

    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role || '' }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const email = clean(req.body.email).toLowerCase();
    const password = clean(req.body.password);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Wrong password.' });
    }

    await ensureState(user._id);

    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role || '' }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/state/:userId', async (req, res) => {
  try {
    const state = await ensureState(req.params.userId);
    res.json({ tasks: state.tasks || [], doneTasks: state.doneTasks || [], transcriptHistory: state.transcriptHistory || [] });
  } catch (err) {
    console.error(err);
    res.json({ tasks: [], doneTasks: [], transcriptHistory: [] });
  }
});

app.post('/state/:userId', async (req, res) => {
  try {
    const tasks = dedupeTasks(arr(req.body.tasks).filter(isValidTask));
    const doneTasks = dedupeTasks(arr(req.body.doneTasks).filter(isValidTask));
    await TaskState.findOneAndUpdate(
      { userId: req.params.userId },
      { userId: req.params.userId, tasks, doneTasks, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'State save failed.' });
  }
});

app.post('/analyze', async (req, res) => {
  try {
    console.log('ANALYZE BODY:', req.body);

    const { userId, transcript, meetingIdentity } = req.body;
    if (!userId || !transcript || !meetingIdentity) {
      return res.json({ success: false, message: 'Missing required fields.' });
    }

    const state = await ensureState(userId);
    const parsed = parseTranscript(transcript);
    const currentTasks = dedupeTasks(arr(state.tasks));
    const currentDone = dedupeTasks(arr(state.doneTasks));

    const existsInAny = (task, list) =>
      list.some(t =>
        String(t.text || '').toLowerCase() === String(task.text || '').toLowerCase() &&
        String(t.assignee || '').toLowerCase() === String(task.assignee || '').toLowerCase()
      );

    for (const task of parsed) {
      if (task.done) {
        if (!existsInAny(task, currentDone)) currentDone.push(task);
      } else {
        if (!existsInAny(task, currentTasks)) currentTasks.push(task);
      }
    }

    const normalizedMeeting = String(meetingIdentity).toLowerCase();
    const userFound = parsed.some(t => String(t.assignee || '').toLowerCase() === normalizedMeeting);

    state.tasks = currentTasks;
    state.doneTasks = currentDone;
    state.transcriptHistory = state.transcriptHistory || [];
    state.transcriptHistory.push({ transcript, meetingIdentity, createdAt: new Date() });
    state.updatedAt = new Date();

    await state.save();

    return res.json({
      success: true,
      message: userFound ? `Extracted ${parsed.length} tasks.` : `${meetingIdentity} not found in meeting ❌`,
      tasks: currentTasks,
      doneTasks: currentDone,
      parsedTasks: parsed
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Analyze failed.' });
  }
});

app.post('/reset/:userId', async (req, res) => {
  try {
    await TaskState.findOneAndUpdate(
      { userId: req.params.userId },
      { userId: req.params.userId, tasks: [], doneTasks: [], transcriptHistory: [], updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Reset failed.' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
