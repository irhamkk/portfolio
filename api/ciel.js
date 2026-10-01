const https = require('https');
const knowledge = require('./_knowledge.json');

// Helper to make HTTPS requests
function httpsPost(url, payload) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: u.hostname,
        port: 443,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              resolve(data);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// In-memory ranked retrieval based on keyword relevance
function retrieveContext(query, lang = 'id') {
  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const matchedItems = [];

  // 1. Check Profile & Education
  let profileScore = 0;
  if (/irham|siapa|background|profil|kuliah|studi|pendidikan|unpad|statistika|who|study/i.test(query)) {
    profileScore = 15;
  }
  matchedItems.push({
    item: {
      type: 'Profile',
      title: 'Profil & Latar Belakang Irham',
      url: '/about',
      text: lang === 'id' ? knowledge.profile.summary_id : knowledge.profile.summary_en,
      extra: `Lulusan Statistika UNPAD (2019-2024), fokus: ${knowledge.profile.focus.join(', ')}.`,
    },
    score: profileScore,
  });

  // 2. Check Projects
  knowledge.projects.forEach((p) => {
    let score = 0;
    const combined = `${p.title} ${p.category} ${p.tags.join(' ')} ${p.summary_id} ${p.summary_en}`.toLowerCase();
    terms.forEach((t) => {
      if (p.title.toLowerCase().includes(t)) score += 6;
      if (p.tags.some((tag) => tag.toLowerCase().includes(t))) score += 4;
      if (combined.includes(t)) score += 2;
    });
    if (/project|proyek|karya|buat|bikin|build|repo/i.test(query)) score += 2;
    matchedItems.push({
      item: {
        type: 'Project',
        title: p.title,
        url: p.url,
        text: lang === 'id' ? p.summary_id : p.summary_en,
        extra: `Tags: ${p.tags.join(', ')} · Status: ${p.status}`,
      },
      score,
    });
  });

  // 3. Check Lab Experiments
  knowledge.lab.forEach((l) => {
    let score = 0;
    const combined = `${l.title} ${l.tags.join(' ')} ${l.summary_id} ${l.summary_en}`.toLowerCase();
    terms.forEach((t) => {
      if (l.title.toLowerCase().includes(t)) score += 5;
      if (l.tags.some((tag) => tag.toLowerCase().includes(t))) score += 3;
      if (combined.includes(t)) score += 2;
    });
    if (/lab|eksperimen|experiment|riset|test|ciel|hermes|search/i.test(query)) score += 3;
    matchedItems.push({
      item: {
        type: 'Lab',
        title: l.title,
        url: l.url,
        text: lang === 'id' ? l.summary_id : l.summary_en,
        extra: `Status: ${l.status} · Tags: ${l.tags.join(', ')}`,
      },
      score,
    });
  });

  // 4. Check Signals
  knowledge.signals.forEach((s) => {
    let score = 0;
    const combined = `${s.type} ${s.title} ${s.tags.join(' ')} ${s.content_id} ${s.content_en}`.toLowerCase();
    terms.forEach((t) => {
      if (s.title.toLowerCase().includes(t)) score += 6;
      if (s.tags.some((tag) => tag.toLowerCase().includes(t))) score += 4;
      if (combined.includes(t)) score += 2;
    });
    if (/pendapat|opini|thesis|tesis|tulisan|pikiran|view|think|signal|workflow|dashboard|data/i.test(query)) score += 3;
    matchedItems.push({
      item: {
        type: 'Signal',
        title: `${s.type}: ${s.title}`,
        url: s.url,
        text: lang === 'id' ? s.content_id : s.content_en,
        extra: `Tags: ${s.tags.join(', ')}`,
      },
      score,
    });
  });

  // 5. Check Experience
  knowledge.experience.forEach((e) => {
    let score = 0;
    const combined = `${e.role} ${e.organization} ${e.description_id} ${e.description_en}`.toLowerCase();
    terms.forEach((t) => {
      if (combined.includes(t)) score += 3;
    });
    if (/kerja|pengalaman|experience|dumpling|cimahi|ruangguru|gudang/i.test(query)) score += 4;
    matchedItems.push({
      item: {
        type: 'Experience',
        title: `${e.role} at ${e.organization}`,
        url: '/about',
        text: lang === 'id' ? e.description_id : e.description_en,
        extra: `Period: ${e.period}`,
      },
      score,
    });
  });

  // Sort by score descending and take top 4 items
  matchedItems.sort((a, b) => b.score - a.score);
  const relevant = matchedItems.filter((m) => m.score > 0).slice(0, 4);

  // If nothing matched with high confidence, pick top general items (profile + latest projects)
  const topList = relevant.length > 0 ? relevant : matchedItems.slice(0, 3);

  const contextText = topList
    .map((m, idx) => `[Sumber ${idx + 1}] (${m.item.type}) ${m.item.title}\n${m.item.text}\n${m.item.extra}`)
    .join('\n\n');

  const sources = topList.map((m) => ({
    title: m.item.title,
    url: m.item.url,
    type: m.item.type,
  }));

  return { contextText, sources };
}

// Fallback response synthesizer if API key is not yet set
function localFallbackResponse(query, lang = 'id') {
  const q = query.toLowerCase();
  if (q.includes('project') || q.includes('proyek') || q.includes('karya') || q.includes('bikin')) {
    return lang === 'id'
      ? 'Irham berfokus membangun sistem automasi dan AI nyata. Beberapa project utamanya meliputi: Self-hosted AI Agent Stack (Hermes 2 Pro di VPS), Ciel WhatsApp AI Assistant, UMKM Analyst Bot (manajemen gudang via Telegram), dan X Auto-Poster. Semuanya dirancang untuk menyelesaikan alur kerja nyata.'
      : 'Irham builds real-world automation and AI systems. His key projects include a Self-hosted AI Agent Stack (Hermes 2 Pro on VPS), Ciel WhatsApp AI Assistant, UMKM Analyst Bot for warehouse inventory via Telegram, and an automated X publishing pipeline.';
  }
  if (q.includes('agent') || q.includes('pendapat') || q.includes('opini') || q.includes('workflow')) {
    return lang === 'id'
      ? 'Menurut tesis Irham di Signals: "AI tidak memperbaiki alur kerja yang buruk, melainkan hanya mempercepat proses yang berantakan." Irham meyakini agent AI yang benar-benar bernilai bukanlah yang serba tahu, melainkan yang dapat dipercaya memegang alur kerja sempit secara tuntas.'
      : 'In his published signals, Irham emphasizes that "AI doesn\'t fix a bad workflow—it usually just makes the messy process run faster." He believes the most useful AI agents are narrow and reliably own a specific workflow from trigger to result.';
  }
  return lang === 'id'
    ? 'Irham Khairul Kalam adalah lulusan Statistika UNPAD yang berfokus pada rekayasa sistem data, automasi alur kerja, dan arsitektur agent AI mandiri.'
    : 'Irham Khairul Kalam is a Statistics graduate from Universitas Padjadjaran specializing in workflow automation, data systems, and persistent self-hosted AI agents.';
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const message = (body.message || '').trim();
    const language = body.language === 'en' ? 'en' : 'id';
    const model = body.model || 'Ciel 3.2';
    const isConcise = model.includes('3.1');

    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (message.length > 800) {
      return res.status(400).json({ error: 'Message is too long (max 800 chars).' });
    }

    // Retrieve relevant context from repository knowledge
    const { contextText, sources } = retrieveContext(message, language);

    // Check for GEMINI_API_KEY from environment or local key file
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      try {
        const fs = require('fs');
        const path = require('path');
        const localKeyPath = path.join(__dirname, 'gemini_key.txt');
        if (fs.existsSync(localKeyPath)) {
          apiKey = fs.readFileSync(localKeyPath, 'utf8').trim();
        }
      } catch (_) {}
    }

    if (!apiKey) {
      // Graceful local fallback when API key is not yet set
      const answer = localFallbackResponse(message, language);
      return res.status(200).json({
        answer,
        sources: sources.slice(0, 2),
        model,
        mode: 'prototype_fallback',
        note: 'GEMINI_API_KEY is not yet configured on Vercel environment variables.',
      });
    }

    // System prompt with strict scoping
    const systemPrompt = `Kamu adalah Ciel, asisten kecerdasan personal untuk Irham Khairul Kalam dan website resminya irhamkk.world.
Tugas utamamu: menjawab pertanyaan pengunjung seputar profil, latar belakang, pendidikan, proyek, eksperimen di Lab, serta pemikiran/opini (Signals) Irham berdasarkan KNOWLEDGE CONTEXT di bawah ini.

ATURAN KETAT & FORMAT JAWABAN:
1. Ruang lingkup faktualmu TERBATAS hanya pada informasi resmi yang dipublikasikan tentang Irham.
2. Jika pengguna menanyakan hal umum di luar Irham (misalnya pertanyaan matematika umum, resep masakan, tokoh politik, gosip), tolak secara sopan dan jelaskan bahwa Ciel hanya dirancang untuk menjawab seputar karya, proyek, dan pemikiran Irham.
3. Jangan mengarang atau berhalusinasi informasi pribadi yang tidak ada dalam konteks.
4. Jawab secara alami dan ramah dalam bahasa yang sama dengan pertanyaan pengguna (${language === 'en' ? 'English' : 'Bahasa Indonesia'}).
5. FORMAT LAYOUT HARUS RAPI:
   - Gunakan paragraf pendek (2-3 kalimat) agar tidak bertumpuk padat.
   - Gunakan daftar bernomor (1., 2., 3.) atau bullet points (- ) saat menguraikan beberapa poin atau proyek.
   - Gunakan cetak tebal (**kata kunci**) secara wajar untuk judul poin. Jangan menumpuk asteris (* *) berlebihan tanpa spasi.
6. Mode: ${isConcise ? 'Ciel 3.1 (Jawaban ringkas to the point, maksimal 2-3 kalimat padat).' : 'Ciel 3.2 (Jawaban komprehensif, mengulas detail proyek dan menghubungkan ide-ide Irham secara mendalam).'}`;

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nKNOWLEDGE CONTEXT:\n${contextText}\n\nPERTANYAAN PENGUNJUNG:\n${message}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: isConcise ? 0.2 : 0.35,
        maxOutputTokens: isConcise ? 350 : 750,
      },
    };

    // Google Gemini API endpoint (fast and stable 3.5 Flash Lite)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const geminiRes = await httpsPost(geminiUrl, geminiPayload);

    let answer = '';
    if (
      geminiRes &&
      geminiRes.candidates &&
      geminiRes.candidates[0] &&
      geminiRes.candidates[0].content &&
      geminiRes.candidates[0].content.parts &&
      geminiRes.candidates[0].content.parts[0]
    ) {
      answer = geminiRes.candidates[0].content.parts[0].text.trim();
    } else {
      answer = localFallbackResponse(message, language);
    }

    return res.status(200).json({
      answer,
      sources,
      model,
    });
  } catch (err) {
    console.error('Ciel API error:', err.message);
    const lang = req.body && req.body.language === 'en' ? 'en' : 'id';
    return res.status(200).json({
      answer:
        lang === 'en'
          ? 'Ciel is currently running in local prototype mode while the external API connection is being refreshed.'
          : 'Ciel saat ini berjalan dalam mode prototipe lokal selagi koneksi API eksternal sedang diperbarui.',
      sources: [
        { title: 'Self-hosted AI Agent Stack', url: '/lab#selected-projects', type: 'Project' },
      ],
      model: 'Ciel 3.2',
    });
  }
};
