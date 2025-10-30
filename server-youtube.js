const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/analyze', async (req, res) => {
  console.log('Requête reçue:', req.body);
  
  const { videoId } = req.body;
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    console.log('ERREUR: Clé API manquante');
    return res.status(500).json({ error: 'YouTube API key manquante' });
  }

  if (!videoId) {
    console.log('ERREUR: Video ID manquant');
    return res.status(400).json({ error: 'Video ID requis' });
  }

  console.log('Analyse vidéo ID:', videoId);

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=statistics,snippet&key=${API_KEY}`;
    console.log('Appel API YouTube...');
    
    const response = await axios.get(url);
    console.log('Réponse reçue, items:', response.data.items?.length);

    if (!response.data.items || response.data.items.length === 0) {
      console.log('ERREUR: Vidéo non trouvée');
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

    console.log('Succès! Vidéo:', result.title);
    console.log('Vues:', result.views.toLocaleString());
    res.json(result);

  } catch (error) {
    console.error('ERREUR complète:', error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'Erreur API YouTube: ' + (error.response.data?.error?.message || error.message)
      });
    }
    
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    apis: {
      youtube: !!process.env.YOUTUBE_API_KEY
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('==================================================');
  console.log('SERVEUR DEMARRE');
  console.log('==================================================');
  console.log('URL: http://localhost:' + PORT);
  console.log('==================================================');
  console.log('YouTube API:', process.env.YOUTUBE_API_KEY ? 'Configurée' : 'NON CONFIGURÉE');
  console.log('==================================================');
});