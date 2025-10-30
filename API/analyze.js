const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.body;
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'YouTube API key manquante' });
  }

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID requis' });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=statistics,snippet&key=${API_KEY}`;
    const response = await axios.get(url);

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ error: 'Vidéo non trouvée' });
    }

    const video = response.data.items[0];
    const stats = video.statistics;

    const result = {
      platform: 'youtube',
      videoId: videoId,
      title: video.snippet.title,
      views: parseInt(stats.viewCount) || 0,
      likes: parseInt(stats.likeCount) || 0,
      comments: parseInt(stats.commentCount) || 0,
      shares: 0,
      publishedAt: video.snippet.publishedAt,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      estimatedImpressions: Math.floor((parseInt(stats.viewCount) || 0) * (3 + Math.random() * 2)),
      timestamp: new Date().toISOString()
    };

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: 'Erreur API: ' + error.message });
  }
};