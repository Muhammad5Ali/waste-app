import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET top reporters
// In userRoutes.js
router.get('/top-reporters', async (req, res) => {
  try {
    const topReporters = await User.find()
      .sort({ reportCount: -1, points: -1 })
      .limit(10)
      .select('username profileImage reportCount points _id')
      .lean(); // Convert to plain JS objects

    // Add rank position to each reporter
    const reportersWithRank = topReporters.map((reporter, index) => ({
      ...reporter,
      rank: index + 1
    }));

    res.json(reportersWithRank);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alternative endpoint
router.get('/top-reporters-advanced', async (req, res) => {
  try {
    const topReporters = await User.aggregate([
      {
        $sort: { 
          reportCount: -1,
          points: -1 
        }
      },
      { $limit: 10 },
      {
        $project: {
          username: 1,
          profileImage: 1,
          reportCount: 1,
          points: 1,
          rank: { $add: ["$reportCount", "$points"] }
        }
      }
    ]);

    res.json(topReporters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;