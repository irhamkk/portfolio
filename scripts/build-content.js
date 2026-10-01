const fs = require('fs');
const path = require('path');

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: content.trim() };
  }
  const rawYaml = match[1];
  const body = match[2].trim();
  const data = {};

  for (const line of rawYaml.split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        val = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } catch (_) {
        val = [];
      }
    } else {
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).replace(/\\"/g, '"');
      }
    }
    data[key] = val;
  }
  return { data, body };
}

function buildContent() {
  console.log('--- Building content & syncing knowledge base ---');
  const signalsDir = path.join(__dirname, '..', 'content', 'signals');
  if (!fs.existsSync(signalsDir)) {
    console.warn('Directory content/signals not found, skipping.');
    return;
  }

  const files = fs.readdirSync(signalsDir).filter((f) => f.endsWith('.md')).sort().reverse();

  const signalsEN = [];
  const signalsID = [];
  const knowledgeSignals = [];

  for (const file of files) {
    const filePath = path.join(signalsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, body } = parseFrontmatter(content);

    const slug = path.basename(file, '.md');
    const type = data.type || 'TAKE';

    // Dates
    const dateID = data.date || data.date_id || '2026';
    const dateEN = data.date_en || data.date || '2026';

    // Titles
    const titleID = data.title || data.title_id || slug;
    const titleEN = data.title_en || data.title || slug;

    // Tags
    const tagsID = Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t) => t.trim()) : []);
    const tagsEN = Array.isArray(data.tags_en) ? data.tags_en : (data.tags_en ? data.tags_en.split(',').map((t) => t.trim()) : tagsID);

    // Summaries / Copies
    let summaryID = data.summary || data.summary_id || data.copy || '';
    let summaryEN = data.summary_en || data.copy_en || summaryID;

    // If summary is empty, take first non-heading paragraph of body
    if (!summaryID && body) {
      const paragraphs = body.split(/\r?\n\r?\n/).map((p) => p.trim()).filter((p) => p && !p.startsWith('#'));
      if (paragraphs.length) {
        summaryID = paragraphs[0].replace(/[*_`]/g, '');
        if (!summaryEN) summaryEN = summaryID;
      }
    }

    signalsEN.push({
      type,
      date: dateEN,
      title: titleEN,
      copy: summaryEN,
      tags: tagsEN,
    });

    signalsID.push({
      type,
      date: dateID,
      title: titleID,
      copy: summaryID,
      tags: tagsID,
    });

    knowledgeSignals.push({
      id: slug,
      type,
      title: titleID,
      title_en: titleEN,
      date: dateID,
      date_en: dateEN,
      tags: tagsID,
      tags_en: tagsEN,
      url: '/signals',
      content_id: summaryID,
      content_en: summaryEN,
      body: body,
    });
  }

  console.log(`Parsed ${files.length} signals/essays from markdown.`);

  // 1. Update api/_knowledge.json
  const knowledgePath = path.join(__dirname, '..', 'api', '_knowledge.json');
  if (fs.existsSync(knowledgePath)) {
    const knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
    knowledge.signals = knowledgeSignals;
    fs.writeFileSync(knowledgePath, JSON.stringify(knowledge, null, 2), 'utf8');
    console.log(`Updated api/_knowledge.json with ${knowledgeSignals.length} rich signals!`);
  }

  // 2. Update script.js with strict marker replacement
  const scriptPath = path.join(__dirname, '..', 'script.js');
  if (fs.existsSync(scriptPath)) {
    let scriptCode = fs.readFileSync(scriptPath, 'utf8');

    const enSignalsJson = JSON.stringify(signalsEN, null, 6)
      .split('\n')
      .map((l, i) => (i === 0 ? l : '    ' + l))
      .join('\n');

    const idSignalsJson = JSON.stringify(signalsID, null, 6)
      .split('\n')
      .map((l, i) => (i === 0 ? l : '    ' + l))
      .join('\n');

    scriptCode = scriptCode.replace(
      /\/\* SIGNALS_EN_START \*\/[\s\S]*?\/\* SIGNALS_EN_END \*\//,
      `/* SIGNALS_EN_START */\n    ${enSignalsJson}\n    /* SIGNALS_EN_END */`
    );

    scriptCode = scriptCode.replace(
      /\/\* SIGNALS_ID_START \*\/[\s\S]*?\/\* SIGNALS_ID_END \*\//,
      `/* SIGNALS_ID_START */\n    ${idSignalsJson}\n    /* SIGNALS_ID_END */`
    );

    fs.writeFileSync(scriptPath, scriptCode, 'utf8');
    console.log(`Updated script.js CONTENT.en and CONTENT.id signals list with 100% precision!`);
  }

  console.log('--- Content build & sync complete! ---');
  return { count: files.length };
}

if (require.main === module) {
  buildContent();
}

module.exports = buildContent;
