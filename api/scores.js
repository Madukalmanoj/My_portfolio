import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { game } = req.query; 
  if (!game || (game !== 'dodge' && game !== 'agi')) {
    return res.status(400).json({ error: 'Invalid game specified' });
  }

  const KV_KEY = `leaderboard_${game}`;

  if (req.method === 'GET') {
    try {
      const leaderboard = await kv.get(KV_KEY) || [];
      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error('KV GET Error:', error);
      // Return empty array if DB not connected yet
      return res.status(200).json([]); 
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, score } = req.body;
      if (typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      let leaderboard = await kv.get(KV_KEY) || [];
      
      leaderboard.push({ 
        name: (name || 'Anonymous').trim().slice(0, 12), 
        score 
      });
      
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard = leaderboard.slice(0, 20); // Keep top 20

      await kv.set(KV_KEY, leaderboard);
      
      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error('KV POST Error:', error);
      return res.status(500).json({ error: 'Failed to save score. Make sure Vercel KV is connected.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
