import express from 'express';

const router = express.Router();

// Get incidents
router.get('/', (req, res) => {
  res.json({ success: true, incidents: [] });
});

// Submit incident
router.post('/', (req, res) => {
  res.json({ success: true, incidentId: Date.now() });
});

export default router;
