const express = require('express');
const router = express.Router();
const { sendChatMessage, getModelsInfo, clearCache, resetFailures } = require('../services/ai-proxy');
const { aiUserRateLimit, aiIpRateLimit, getRateLimitStatus } = require('../middleware/ai-rate-limit');
const { authenticate } = require('../middleware/auth');

/**
 * AI Chat Routes
 * Handles AI conversations with smart model rotation
 */

// Apply IP-based rate limiting to all AI routes
router.use(aiIpRateLimit);

/**
 * POST /api/ai/chat
 * Send a message to AI assistant
 * 
 * Body:
 * - message: string (required) - User's message
 * - conversationHistory: array (optional) - Previous messages
 * - systemPrompt: string (optional) - Custom system prompt
 * - options: object (optional) - AI generation options
 */
router.post('/chat', authenticate, aiUserRateLimit, async (req, res) => {
  try {
    const { message, conversationHistory = [], systemPrompt, options = {} } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    }
    
    // Limit message length
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long. Maximum 2000 characters allowed.',
      });
    }
    
    // Build messages array
    const messages = [
      ...conversationHistory.slice(-10), // Keep only last 10 messages for context
      { role: 'user', content: message },
    ];
    
    // Use provided system prompt or default
    const defaultSystemPrompt = `You are Estato AI - Lucknow's smartest real estate assistant. 
You help users with property buying, selling, renting in Lucknow. 
Be friendly, concise, and helpful. Use Hinglish when appropriate.
Keep responses under 300 words.`;
    
    const prompt = systemPrompt || defaultSystemPrompt;
    
    // Merge options with defaults
    const aiOptions = {
      maxTokens: Math.min(options.maxTokens || 400, 500), // Cap at 500 tokens
      temperature: Math.min(Math.max(options.temperature || 0.6, 0), 1),
      topP: Math.min(Math.max(options.topP || 0.9, 0), 1),
      useCache: options.useCache !== false, // Cache by default
    };
    
    // Send to AI proxy
    const result = await sendChatMessage(messages, prompt, aiOptions);
    
    if (!result.success) {
      return res.status(503).json({
        success: false,
        error: result.error,
        details: result.details,
      });
    }
    
    // Return successful response
    res.json({
      success: true,
      data: {
        message: result.message,
        model: result.model,
        cached: result.cached,
      },
    });
    
  } catch (error) {
    console.error('❌ AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI request',
      details: error.message,
    });
  }
});

/**
 * POST /api/ai/property-suggestions
 * Get AI property suggestions based on criteria
 */
router.post('/property-suggestions', authenticate, aiUserRateLimit, async (req, res) => {
  try {
    const { budget, propertyType, purpose, preferredArea, bedrooms } = req.body;
    
    if (!budget || !propertyType || !purpose) {
      return res.status(400).json({
        success: false,
        error: 'Budget, propertyType, and purpose are required',
      });
    }
    
    const query = `I'm looking for property in Lucknow:
- Budget: ${budget}
- Type: ${propertyType}
- Purpose: ${purpose}
${preferredArea ? `- Preferred Area: ${preferredArea}` : ''}
${bedrooms ? `- Bedrooms: ${bedrooms}` : ''}

Please suggest suitable areas and what I should look for. Keep it concise.`;
    
    const messages = [{ role: 'user', content: query }];
    
    const systemPrompt = `You are Estato AI - Lucknow's real estate expert.
Provide concise property suggestions based on user criteria.
Mention 2-3 suitable areas with approximate prices.
Keep response under 200 words.`;
    
    const result = await sendChatMessage(messages, systemPrompt, {
      maxTokens: 300,
      temperature: 0.7,
    });
    
    if (!result.success) {
      return res.status(503).json({
        success: false,
        error: result.error,
      });
    }
    
    res.json({
      success: true,
      data: {
        suggestions: result.message,
        model: result.model,
      },
    });
    
  } catch (error) {
    console.error('❌ Property suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate property suggestions',
    });
  }
});

/**
 * POST /api/ai/compare-areas
 * Compare two areas in Lucknow
 */
router.post('/compare-areas', authenticate, aiUserRateLimit, async (req, res) => {
  try {
    const { area1, area2 } = req.body;
    
    if (!area1 || !area2) {
      return res.status(400).json({
        success: false,
        error: 'Both area1 and area2 are required',
      });
    }
    
    const query = `Compare ${area1} and ${area2} in Lucknow for property investment. Which is better and why? Keep it brief.`;
    
    const messages = [{ role: 'user', content: query }];
    
    const systemPrompt = `You are Estato AI - Lucknow's real estate expert.
Compare areas objectively based on connectivity, amenities, prices, and growth potential.
Keep response under 200 words.`;
    
    const result = await sendChatMessage(messages, systemPrompt, {
      maxTokens: 300,
      temperature: 0.6,
    });
    
    if (!result.success) {
      return res.status(503).json({
        success: false,
        error: result.error,
      });
    }
    
    res.json({
      success: true,
      data: {
        comparison: result.message,
        model: result.model,
      },
    });
    
  } catch (error) {
    console.error('❌ Area comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare areas',
    });
  }
});

/**
 * POST /api/ai/price-guidance
 * Get price guidance for a property
 */
router.post('/price-guidance', authenticate, aiUserRateLimit, async (req, res) => {
  try {
    const { propertyType, area, size } = req.body;
    
    if (!propertyType || !area || !size) {
      return res.status(400).json({
        success: false,
        error: 'propertyType, area, and size are required',
      });
    }
    
    const query = `What is the current market rate for a ${size} ${propertyType} in ${area}, Lucknow? Is it a good time to buy?`;
    
    const messages = [{ role: 'user', content: query }];
    
    const systemPrompt = `You are Estato AI - Lucknow's real estate expert.
Provide approximate price ranges and brief market insights.
Keep response under 150 words.`;
    
    const result = await sendChatMessage(messages, systemPrompt, {
      maxTokens: 250,
      temperature: 0.6,
    });
    
    if (!result.success) {
      return res.status(503).json({
        success: false,
        error: result.error,
      });
    }
    
    res.json({
      success: true,
      data: {
        guidance: result.message,
        model: result.model,
      },
    });
    
  } catch (error) {
    console.error('❌ Price guidance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get price guidance',
    });
  }
});

/**
 * GET /api/ai/rate-limit-status
 * Get current user's rate limit status
 */
router.get('/rate-limit-status', authenticate, (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const status = getRateLimitStatus(userId);
    
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('❌ Rate limit status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rate limit status',
    });
  }
});

/**
 * GET /api/ai/models-info
 * Get information about available AI models
 */
router.get('/models-info', (req, res) => {
  try {
    const info = getModelsInfo();
    
    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error('❌ Models info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get models info',
    });
  }
});

/**
 * POST /api/ai/admin/clear-cache
 * Admin: Clear AI response cache
 */
router.post('/admin/clear-cache', authenticate, (req, res) => {
  try {
    // Check if user is admin (you can add proper admin check here)
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }
    
    clearCache();
    
    res.json({
      success: true,
      message: 'AI cache cleared successfully',
    });
  } catch (error) {
    console.error('❌ Clear cache error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

/**
 * POST /api/ai/admin/reset-failures
 * Admin: Reset model failure tracking
 */
router.post('/admin/reset-failures', authenticate, (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }
    
    resetFailures();
    
    res.json({
      success: true,
      message: 'Model failures reset successfully',
    });
  } catch (error) {
    console.error('❌ Reset failures error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset failures',
    });
  }
});

module.exports = router;

