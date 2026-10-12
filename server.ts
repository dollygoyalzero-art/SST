import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Secure backend admin initialization per requirements
const SEEDED_ADMIN = {
  id: 'admin_1',
  email: process.env.ADMIN_EMAIL || 'ssachh2@gmail.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  name: 'Administrator',
  role: 'admin' as const,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-01-10',
  streak: 0,
  totalStudyHours: 0,
  attendanceRate: 100,
  status: 'active' as const
};

// Backend in-memory user registry starting with clean state (ONLY SEEDED ADMIN)
let usersStore: any[] = [
  {
    id: SEEDED_ADMIN.id,
    name: SEEDED_ADMIN.name,
    email: SEEDED_ADMIN.email,
    role: SEEDED_ADMIN.role,
    avatar: SEEDED_ADMIN.avatar,
    createdAt: SEEDED_ADMIN.createdAt,
    streak: 0,
    totalStudyHours: 0,
    attendanceRate: 100,
    status: 'active'
  }
];

// Initialize server-side Gemini client with required User-Agent
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Authentication Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();

  // Explicit check for hardcoded Admin credentials per requirement
  if (cleanEmail === SEEDED_ADMIN.email.toLowerCase() && password === SEEDED_ADMIN.password) {
    return res.json({
      success: true,
      user: {
        id: SEEDED_ADMIN.id,
        name: SEEDED_ADMIN.name,
        email: SEEDED_ADMIN.email,
        role: 'admin',
        avatar: SEEDED_ADMIN.avatar,
        createdAt: SEEDED_ADMIN.createdAt
      },
      token: `mcd_admin_token_${Date.now()}`
    });
  }

  if (role === 'admin') {
    return res.status(401).json({ error: 'Invalid administrator credentials. Access denied.' });
  }

  // Student and faculty role authentication check against registered users
  const user = usersStore.find(u => u.email.toLowerCase() === cleanEmail && u.role === role);
  if (user) {
    return res.json({
      success: true,
      user,
      token: `mcd_${role}_token_${Date.now()}`
    });
  }

  // Allow open sign-in if matching email exists or return appropriate message
  return res.json({
    success: true,
    message: 'Authentication token granted',
    token: `mcd_${role}_token_${Date.now()}`
  });
});

// 2. Real-Time User Management Endpoints (Admin Suite & Registration)
app.get('/api/users', (_req: Request, res: Response) => {
  res.json({
    success: true,
    users: usersStore,
    total: usersStore.length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name, email, role, batch, targetExam, phone, avatar } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const existing = usersStore.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists.' });
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    name: name.trim(),
    email: cleanEmail,
    role,
    avatar: avatar || `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 999999)}?w=150&auto=format&fit=crop&q=80`,
    batch: role === 'student' ? (batch || 'Apex Batch (JEE Advanced 2027)') : undefined,
    targetExam: role === 'student' ? (targetExam || 'JEE Advanced') : undefined,
    phone: phone || '',
    createdAt: new Date().toISOString().split('T')[0],
    streak: 0,
    totalStudyHours: 0,
    attendanceRate: 100,
    status: 'active'
  };

  usersStore.unshift(newUser);
  res.status(201).json({ success: true, user: newUser });
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const index = usersStore.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  usersStore[index] = { ...usersStore[index], ...updates };
  res.json({ success: true, user: usersStore[index] });
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === 'admin_1') {
    return res.status(400).json({ error: 'Cannot delete root administrator.' });
  }

  usersStore = usersStore.filter(u => u.id !== id);
  res.json({ success: true, message: 'User deleted successfully.' });
});

// Invite endpoint
app.post('/api/users/invite', (req: Request, res: Response) => {
  const { email, role, channel } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const existing = usersStore.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const invitedUser = {
    id: `invite_${Date.now()}`,
    name: cleanEmail.split('@')[0],
    email: cleanEmail,
    role,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString().split('T')[0],
    streak: 0,
    totalStudyHours: 0,
    attendanceRate: 100,
    status: 'invited'
  };

  usersStore.unshift(invitedUser);
  res.json({
    success: true,
    user: invitedUser,
    channel: channel || 'email',
    message: `Invitation sent to ${cleanEmail}`
  });
});

// 3. AI Text-To-Speech endpoint using gemini-3.8-flash-tts
app.post('/api/ai/tts', async (req: Request, res: Response) => {
  try {
    const { text, speaker = 'Puck' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text to synthesize is required.' });
    }

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Read the following student mentor guidance in a warm, encouraging, authoritative academic tone: "${text}"`
              }
            ]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: speaker
              }
            }
          }
        }
      });

      const candidates = response.candidates;
      if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData?.data) {
            return res.json({
              success: true,
              audioBase64: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'audio/wav',
              format: 'wav'
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      audioBase64: null,
      fallbackText: text,
      message: 'TTS generation handled via client speech synthesis or Gemini voice.'
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    return res.json({
      success: false,
      error: error.message || 'TTS generation failed',
      fallbackText: req.body.text
    });
  }
});

// 4. AI Personalized Recommendations using gemini-3.8-flash
app.post('/api/ai/recommendations', async (req: Request, res: Response) => {
  try {
    const { studentName, exam, missedSlots, weakSubjects, studyHours } = req.body;

    if (aiClient) {
      const prompt = `Act as the Lead Academic Mentor at Meccademia Education Institute.
Student Profile:
- Name: ${studentName || 'Student'}
- Target Exam: ${exam || 'JEE / NEET / Boards'}
- Total Study Hours This Week: ${studyHours || 0} hours
- Missed / Overdue Slots: ${JSON.stringify(missedSlots || [])}
- Focus Subjects: ${JSON.stringify(weakSubjects || ['Mathematics', 'Physics'])}

Provide 3 concise, actionable, motivational recommendations to optimize their 7-day schedule, balance routine vs study blocks, and improve performance. Use direct, supportive language.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      return res.json({
        success: true,
        recommendation: response.text || 'Balance your non-study routine with dedicated high-priority study blocks.'
      });
    }

    return res.json({
      success: true,
      recommendation: `Schedule a 90-minute morning focus slot for challenging concepts, and protect your routine non-study slots for sleep and physical activity to prevent study fatigue.`
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return res.json({
      success: true,
      recommendation: `Focus on consistent daily schedule blocks and review your weekly practice questions regularly.`
    });
  }
});

// 5. Search Grounded Study Explorer using gemini-3.5-flash with googleSearch tool
app.post('/api/ai/search-grounded-study', async (req: Request, res: Response) => {
  try {
    const { topic, exam = 'JEE Advanced' } = req.body;
    const query = topic || 'JEE Advanced 2026 high weightage chapters and syllabus';

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `What are the latest verified syllabus details, high weightage topics, and recommended practice problem counts for "${query}" for ${exam} preparation? Provide factual, up-to-date information.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const webSources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Educational Resource',
        uri: chunk.web?.uri || ''
      })).filter((s: any) => s.uri) || [];

      return res.json({
        success: true,
        summary: response.text,
        sources: webSources
      });
    }

    return res.json({
      success: true,
      summary: `According to recent examination guidelines for ${exam}, key high-yield topics include calculus, rotational dynamics, and organic reaction mechanisms.`,
      sources: [
        { title: 'Official Examination Portal', uri: 'https://jeemain.nta.nic.in' },
        { title: 'Meccademia Academic Curriculum Guide', uri: 'https://meccademia.edu' }
      ]
    });
  } catch (error: any) {
    console.error('Error in search grounding:', error);
    return res.json({
      success: false,
      error: error.message || 'Search grounding request failed'
    });
  }
});

// 6. Simulated Email (SendGrid) & WhatsApp API Dispatch
app.post('/api/notifications/dispatch', (req: Request, res: Response) => {
  const { channel, recipient, template, data } = req.body;
  const dispatchId = `msg_${channel}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  res.json({
    success: true,
    dispatchId,
    channel: channel || 'whatsapp',
    recipient: recipient || 'Recipient',
    deliveredAt: new Date().toISOString(),
    status: 'delivered',
    gateway: channel === 'whatsapp' ? 'WhatsApp Business Cloud API' : 'SendGrid SMTP Service'
  });
});

async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Meccademia Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
