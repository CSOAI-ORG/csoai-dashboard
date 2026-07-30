import express from 'express';

const router = express.Router();

// Get badge by token
router.get('/:badgeToken', (req, res) => {
  const { badgeToken } = req.params;
  res.json({ success: true, badgeToken });
});

// Get badge stats
router.get('/:badgeToken/stats', (req, res) => {
  const { badgeToken } = req.params;
  res.json({ success: true, badgeToken, stats: {} });
});

export default router;
