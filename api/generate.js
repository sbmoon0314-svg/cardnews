export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { topic, lang } = req.body;
    const prompts = {
      ko: `카드뉴스 주제: "${topic}"\n\nInstagram 카드뉴스용 슬라이드 문구 5개를 만들어줘.\n규칙:\n- 각 줄 = 슬라이드 1장, 18자 이내\n- 1번: 공감/후킹\n- 2~4번: 숫자/키워드 포함 핵심 정보\n- 5번: 마무리/행동 유도\n- 5줄만, JSON 없이 줄바꿈으로 구분`,
      ja: `テーマ: "${topic}"\n\nInstagramカードニュース用スライドテキスト5枚を作成。\n- 1行=1スライド、20文字以内\n- 1枚目: フック\n- 2〜4枚目: 数字含む核心情報\n- 5枚目: まとめ\n- 5行のみ出力`,
      en: `Topic: "${topic}"\n\nCreate 5 Instagram card news slide captions.\n- 1 line per slide, under 60 chars\n- Line 1: hook/empathy\n- Lines 2-4: key info with numbers\n- Line 5: closing/CTA\n- Output 5 lines only, no JSON`,
    };
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompts[lang] || prompts.ko }],
      }),
    });
    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || '';
    if (!text) throw new Error('empty response');
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
