module.exports = (req, res) => {
  res.json({ 
    status: 'OK',
    apis: {
      youtube: !!process.env.YOUTUBE_API_KEY
    }
  });
};