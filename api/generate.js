export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const topic = body?.topic || '';
    const lang = body?.lang || 'ko';
    const prompts = {
      ko: `카드뉴스 주제: "${topic}"\n\n슬라이드 문구 5개를 만들어줘.\n- 각 줄 18자 이내\n- 5줄만 출력`,
      ja: `テーマ: "${topic}"\n\nスライドテキスト5行のみ出力`,
      en: `Topic: "${topic}"\n\n5 slide captions, 1 line each, under 60 chars. 5 lines only.`,
    };
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'haiku-4-5-20251001', max_tokens: 500, messages: [{ role: 'user', content: prompts[lang] || prompts.ko }] }),
    });
    if (!response.ok) return res.status(500).json({ error: `API error: ${response.status}` });
    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || '';
    if (!text) return res.status(500).json({ error: 'Empty response' });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
