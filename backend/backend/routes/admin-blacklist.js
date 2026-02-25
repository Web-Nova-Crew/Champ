const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { supabase, supabaseAdmin } = require('../config/supabase');

const getDbClient = () => supabaseAdmin || supabase;

router.get('/', authenticate, requireAdmin, async (req, res) => {
  res.json({ success: true, data: [], message: 'Blacklist feature coming soon' });
});

module.exports = router;
