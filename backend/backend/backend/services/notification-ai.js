const axios = require('axios');

/**
 * AI-Powered Notification Service for Estato
 * Generates personalized, engaging notification text using free AI models
 */

// 15 Free AI Models with dedicated API keys
const NOTIFICATION_AI_MODELS = [
  {
    model: 'meta-llama/llama-3.2-3b-instruct:free',
    apiKey: process.env.OPENROUTER_KEY_LLAMA_3B || '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',
    priority: 1
  },
  {
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    apiKey: process.env.OPENROUTER_KEY_LLAMA_70B || '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',
    priority: 1
  },
  {
    model: 'mistralai/mistral-7b-instruct:free',
    apiKey: process.env.OPENROUTER_KEY_MISTRAL_1 || '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',
    priority: 2
  },
  {
    model: 'mistralai/mistral-7b-instruct:free',
    apiKey: process.env.OPENROUTER_KEY_MISTRAL_2 || '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',
    priority: 2
  },
  {
    model: 'mistralai/devstral-2512:free',
    apiKey: process.env.OPENROUTER_KEY_DEVSTRAL || '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',
    priority: 2
  },
  {
    model: 'google/gemma-3-4b-it:free',
    apiKey: process.env.OPENROUTER_KEY_GEMMA_4B || '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',
    priority: 2
  },
  {
    model: 'google/gemma-3-27b-it:free',
    apiKey: process.env.OPENROUTER_KEY_GEMMA_27B || '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',
    priority: 1
  },
  {
    model: 'google/gemma-3-12b-it:free',
    apiKey: process.env.OPENROUTER_KEY_GEMMA_12B || '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',
    priority: 2
  },
  {
    model: 'qwen/qwen-2.5-vl-7b-instruct:free',
    apiKey: process.env.OPENROUTER_KEY_QWEN || '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',
    priority: 2
  },
  {
    model: 'nousresearch/hermes-2-pro-llama-3-8b',
    apiKey: process.env.OPENROUTER_KEY_HERMES || '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',
    priority: 2
  },
  {
    model: 'allenai/olmo-3.1-32b-think:free',
    apiKey: process.env.OPENROUTER_KEY_OLMO || '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',
    priority: 3
  },
  {
    model: 'xiaomi/mimo-v2-flash:free',
    apiKey: process.env.OPENROUTER_KEY_MIMO || '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',
    priority: 3
  },
  {
    model: 'nvidia/nemotron-3-nano-30b-a3b:free',
    apiKey: process.env.OPENROUTER_KEY_NEMOTRON || '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',
    priority: 2
  },
  {
    model: 'nex-agi/deepseek-v3.1-nex-n1:free',
    apiKey: process.env.OPENROUTER_KEY_DEEPSEEK || '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',
    priority: 3
  },
  {
    model: 'arcee-ai/trinity-mini:free',
    apiKey: process.env.OPENROUTER_KEY_TRINITY || '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',
    priority: 3
  }
];

// Sort models by priority
const SORTED_MODELS = NOTIFICATION_AI_MODELS.sort((a, b) => a.priority - b.priority);

// Cache for generated notifications
const notificationCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Current model index for rotation
let currentModelIndex = 0;

/**
 * System prompt for notification generation
 */
const NOTIFICATION_SYSTEM_PROMPT = `You are Estato AI notification writer for a Lucknow-based real estate app.

RULES:
- Max 2 lines (60-80 characters total)
- Hinglish language (Hindi + English mix)
- Friendly, local Lucknow tone
- Use emoji (max 1-2)
- No false urgency
- No promises
- No legal claims
- Be authentic and helpful

TONE GUIDE:
- Gomti Nagar: Premium, sophisticated
- Hazratganj: Elegant, upscale
- Indira Nagar: Family-friendly, warm
- Alambagh: Budget-conscious, practical
- Aliganj: Modern, professional

Generate ONLY the notification text, nothing else.`;

/**
 * Generate cache key for notification
 */
function getCacheKey(eventData) {
  return JSON.stringify({
    event: eventData.event,
    area: eventData.area,
    bhk: eventData.bhk,
    budget: eventData.budget,
    userType: eventData.user_type
  });
}

/**
 * Check if error is rate limit
 */
function isRateLimitError(error) {
  if (!error.response) return false;
  const status = error.response.status;
  return status === 429 || status === 403 || status === 503;
}

/**
 * Call OpenRouter API with specific model and key
 */
async function callOpenRouter(modelConfig, prompt, eventData) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelConfig.model,
        messages: [
          {
            role: 'system',
            content: NOTIFICATION_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 80,
        temperature: 0.6,
        top_p: 0.9,
      },
      {
        headers: {
          'Authorization': `Bearer ${modelConfig.apiKey}`,
          'HTTP-Referer': 'https://estatoprop.com',
          'X-Title': 'Estato Property App',
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content.trim();
    }

    throw new Error('Invalid response format from AI');
  } catch (error) {
    if (isRateLimitError(error)) {
      console.log(`Rate limit hit for model: ${modelConfig.model}`);
      throw new Error('RATE_LIMIT');
    }
    throw error;
  }
}

/**
 * Generate notification text with AI rotation
 */
async function generateNotificationText(eventData) {
  // Check cache first
  const cacheKey = getCacheKey(eventData);
  const cached = notificationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Using cached notification');
    return cached.text;
  }

  // Build prompt from event data
  const prompt = buildPrompt(eventData);

  // Try models in order with rotation
  let attempts = 0;
  const maxAttempts = SORTED_MODELS.length;

  while (attempts < maxAttempts) {
    const modelConfig = SORTED_MODELS[currentModelIndex];
    
    try {
      console.log(`Trying model: ${modelConfig.model} (attempt ${attempts + 1}/${maxAttempts})`);
      
      const notificationText = await callOpenRouter(modelConfig, prompt, eventData);
      
      // Cache successful result
      notificationCache.set(cacheKey, {
        text: notificationText,
        timestamp: Date.now()
      });

      console.log(`✅ Notification generated successfully with ${modelConfig.model}`);
      return notificationText;

    } catch (error) {
      console.error(`❌ Model ${modelConfig.model} failed:`, error.message);
      
      // Rotate to next model
      currentModelIndex = (currentModelIndex + 1) % SORTED_MODELS.length;
      attempts++;

      // If all models failed, use fallback
      if (attempts >= maxAttempts) {
        console.warn('⚠️ All AI models failed, using fallback notification');
        return getFallbackNotification(eventData);
      }
    }
  }

  return getFallbackNotification(eventData);
}

/**
 * Build prompt from event data
 */
function buildPrompt(eventData) {
  const {
    event,
    area,
    budget,
    bhk,
    user_type,
    property_type,
    transaction_type,
    price_drop,
    owner_name
  } = eventData;

  let prompt = `Event: ${event}\n`;
  
  if (area) prompt += `Area: ${area}, Lucknow\n`;
  if (bhk) prompt += `Property: ${bhk}\n`;
  if (budget) prompt += `Budget: ₹${budget}\n`;
  if (property_type) prompt += `Type: ${property_type}\n`;
  if (transaction_type) prompt += `Transaction: ${transaction_type}\n`;
  if (user_type) prompt += `User Type: ${user_type}\n`;
  if (price_drop) prompt += `Price Drop: ₹${price_drop}\n`;
  if (owner_name) prompt += `Owner: ${owner_name}\n`;

  prompt += '\nGenerate a push notification message:';
  
  return prompt;
}

/**
 * Fallback notifications (no AI)
 */
function getFallbackNotification(eventData) {
  const { event, area, bhk, budget, transaction_type } = eventData;

  const fallbacks = {
    new_property: `${area} me naya ${bhk} property available hai 🏠 Dekhiye abhi!`,
    price_drop: `Aapki wishlist wali property ka price kam ho gaya 👀 Check kariye!`,
    inactive_user: `Lucknow me fresh properties aayi hain 🏡 Dekhiye ek baar!`,
    wishlist_match: `${area} me aapke pasand ka property mil gaya 🎯 Dekhiye!`,
    new_listing: `${transaction_type} ke liye ${bhk} available - ₹${budget} 🏠`,
    visit_reminder: `Property visit ka time aa gaya hai ⏰ Ready rahiye!`,
    price_alert: `Property prices me change hua hai 📊 Check kariye!`,
    new_agent_lead: `New buyer lead waiting - respond fast! 🚀`,
  };

  return fallbacks[event] || `Estato pe kuch naya hai aapke liye 🏠 Check kariye!`;
}

/**
 * Main function: Generate notification with AI
 */
async function generateSmartNotification(eventData) {
  try {
    const notificationText = await generateNotificationText(eventData);
    return {
      success: true,
      message: notificationText,
      generatedBy: 'AI',
      model: SORTED_MODELS[currentModelIndex].model
    };
  } catch (error) {
    console.error('Error generating notification:', error);
    return {
      success: true,
      message: getFallbackNotification(eventData),
      generatedBy: 'fallback',
      error: error.message
    };
  }
}

/**
 * Clear notification cache
 */
function clearCache() {
  notificationCache.clear();
  console.log('Notification cache cleared');
}

module.exports = {
  generateSmartNotification,
  clearCache,
  NOTIFICATION_AI_MODELS
};

