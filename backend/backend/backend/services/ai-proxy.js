const axios = require('axios');

/**
 * AI Proxy Service with 30+ Free Models
 * Implements smart rotation, fallback, and rate limit handling
 * 
 * SECURITY: API keys are loaded ONLY from environment variables
 * Set these in Render Dashboard → Environment Variables:
 * - OPENROUTER_API_KEY (single key) or
 * - OPENROUTER_API_KEY_1, OPENROUTER_API_KEY_2, etc. (multiple keys for rotation)
 */

// Load API keys from environment variables ONLY (no hardcoded keys!)
function loadApiKeys() {
  const keys = [];
  
  // Try numbered keys first (for rotation)
  for (let i = 1; i <= 20; i++) {
    const key = process.env[`OPENROUTER_API_KEY_${i}`];
    if (key && key.trim().length > 0 && key.startsWith('sk-or-')) {
      keys.push(key.trim());
    }
  }
  
  // Fallback to single key
  const singleKey = process.env.OPENROUTER_API_KEY;
  if (singleKey && singleKey.trim().length > 0 && singleKey.startsWith('sk-or-') && !keys.includes(singleKey.trim())) {
    keys.push(singleKey.trim());
  }
  
  return keys;
}

// Initialize API keys from environment
let API_KEYS = loadApiKeys();
let currentKeyIndex = 0;
let keyFailures = new Map(); // Track failures per key

// Function to reload API keys (useful if env vars change)
function reloadApiKeys() {
  API_KEYS = loadApiKeys();
  currentKeyIndex = 0;
  keyFailures.clear();
  console.log(`🔑 Loaded ${API_KEYS.length} OpenRouter API key(s)`);
}

// Function to get next working API key with smart rotation
function getNextApiKey() {
  if (API_KEYS.length === 0) {
    console.warn('⚠️  No OpenRouter API keys configured! Set OPENROUTER_API_KEY in environment.');
    return '';
  }
  
  // Find a key with fewer failures
  let attempts = 0;
  while (attempts < API_KEYS.length) {
    const key = API_KEYS[currentKeyIndex];
    const failures = keyFailures.get(key) || 0;
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    
    // Skip keys with too many recent failures
    if (failures < 3) {
      return key;
    }
    attempts++;
  }
  
  // All keys have failures, reset and try first one
  keyFailures.clear();
  return API_KEYS[0];
}

// Mark a key as failed
function markKeyFailed(key) {
  const failures = keyFailures.get(key) || 0;
  keyFailures.set(key, failures + 1);
  
  // Auto-reset after 5 minutes
  setTimeout(() => {
    keyFailures.set(key, Math.max(0, (keyFailures.get(key) || 0) - 1));
  }, 5 * 60 * 1000);
}

// Mark a key as successful
function markKeySuccess(key) {
  keyFailures.set(key, 0);
}

// Log key status on startup
console.log(`🔑 OpenRouter API: ${API_KEYS.length} key(s) loaded from environment`);
if (API_KEYS.length === 0) {
  console.warn('⚠️  WARNING: No API keys found! AI chat will use fallback responses.');
  console.warn('   Set OPENROUTER_API_KEY or OPENROUTER_API_KEY_1 in Render environment variables.');
}

// 40+ Free AI Models from OpenRouter (Tier-based priority)
const FREE_AI_MODELS = {
  // Tier 1: Best Quality (Try these first)
  tier1: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'meta-llama/llama-3-8b-instruct:free',
    'mistralai/mixtral-8x7b-instruct:free',
    'qwen/qwen-2.5-7b-instruct:free',
    'qwen/qwen-2.5-vl-7b-instruct:free',
  ],
  
  // Tier 2: Stable & Reliable
  tier2: [
    'mistralai/mistral-7b-instruct:free',
    'mistralai/devstral-2512:free',
    'google/gemma-3-12b-it:free',
    'google/gemma-3-4b-it:free',
    'google/gemma-2-9b-it:free',
    'google/gemma-7b-it:free',
    'nousresearch/hermes-2-pro-llama-3-8b',
    'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free',
    'nousresearch/nous-hermes-llama2-13b:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'qwen/qwen-2-7b-instruct:free',
    'deepseek/deepseek-chat:free',
    'nex-agi/deepseek-v3.1-nex-n1:free',
  ],
  
  // Tier 3: Good Fallbacks
  tier3: [
    'allenai/olmo-3.1-32b-think:free',
    'xiaomi/mimo-v2-flash:free',
    'arcee-ai/trinity-mini:free',
    'microsoft/phi-3-medium-128k-instruct:free',
    'openchat/openchat-7b:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'cognitivecomputations/dolphin-mixtral-8x7b:free',
    'teknium/openhermes-2.5-mistral-7b:free',
  ],
  
  // Tier 4: Lightweight Fallbacks
  tier4: [
    'undi95/toppy-m-7b:free',
    'gryphe/mythomist-7b:free',
    'gryphe/mythomax-l2-13b:free',
    'koboldai/psyfighter-13b-2:free',
    'intel/neural-chat-7b:free',
    'pygmalionai/mythalion-13b:free',
  ],
  
  // Tier 5: Emergency Fallbacks
  tier5: [
    'openrouter/auto',
    'undi95/remm-slerp-l2-13b:free',
    'mancer/weaver:free',
    'lynn/soliloquy-l3:free',
    'neversleep/noromaid-20b:free',
  ]
};

// Flatten all models into a single array with priority
const ALL_MODELS = [
  ...FREE_AI_MODELS.tier1,
  ...FREE_AI_MODELS.tier2,
  ...FREE_AI_MODELS.tier3,
  ...FREE_AI_MODELS.tier4,
  ...FREE_AI_MODELS.tier5,
];

// Track current model index and failures
let currentModelIndex = 0;
let modelFailures = new Map(); // Track failures per model
let lastSuccessfulModel = ALL_MODELS[0];

// Cache for successful responses (optional)
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if error is rate limit or model unavailable
 */
function isRateLimitOrUnavailable(error) {
  if (!error.response) return false;
  
  const status = error.response.status;
  const errorMessage = error.response.data?.error?.message?.toLowerCase() || '';
  
  // Check for rate limit status codes
  if ([429, 403, 503, 502].includes(status)) {
    return true;
  }
  
  // Check for rate limit messages
  const rateLimitKeywords = [
    'rate limit',
    'too many requests',
    'quota exceeded',
    'model overloaded',
    'capacity',
    'unavailable',
    'temporarily unavailable'
  ];
  
  return rateLimitKeywords.some(keyword => errorMessage.includes(keyword));
}

/**
 * Get next available model with smart rotation
 */
function getNextModel() {
  // Try to use last successful model first
  if (lastSuccessfulModel && modelFailures.get(lastSuccessfulModel) < 3) {
    return lastSuccessfulModel;
  }
  
  // Find next model with least failures
  let attempts = 0;
  while (attempts < ALL_MODELS.length) {
    currentModelIndex = (currentModelIndex + 1) % ALL_MODELS.length;
    const model = ALL_MODELS[currentModelIndex];
    const failures = modelFailures.get(model) || 0;
    
    // Skip models with too many recent failures
    if (failures < 5) {
      return model;
    }
    attempts++;
  }
  
  // If all models have failures, reset and start over
  modelFailures.clear();
  currentModelIndex = 0;
  return ALL_MODELS[0];
}

/**
 * Mark model as failed
 */
function markModelFailed(model) {
  const failures = modelFailures.get(model) || 0;
  modelFailures.set(model, failures + 1);
  
  // Reset failure count after 10 minutes
  setTimeout(() => {
    modelFailures.set(model, Math.max(0, (modelFailures.get(model) || 0) - 1));
  }, 10 * 60 * 1000);
}

/**
 * Mark model as successful
 */
function markModelSuccess(model) {
  lastSuccessfulModel = model;
  modelFailures.set(model, 0);
}

/**
 * Generate cache key for request
 */
function getCacheKey(messages, systemPrompt) {
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  return `${systemPrompt.substring(0, 50)}_${lastUserMessage}`;
}

/**
 * Main AI Chat Function with Smart Rotation
 */
async function sendChatMessage(messages, systemPrompt, options = {}) {
  const {
    maxTokens = 400,
    temperature = 0.6,
    topP = 0.9,
    useCache = true,
  } = options;
  
  // Check cache first
  if (useCache) {
    const cacheKey = getCacheKey(messages, systemPrompt);
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✅ Cache hit for AI request');
      return {
        success: true,
        message: cached.message,
        model: cached.model,
        cached: true,
      };
    }
  }
  
  // Build full messages array
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];
  
  // Check if we have any API keys
  if (API_KEYS.length === 0) {
    console.warn('⚠️  No API keys configured, using fallback AI');
    return {
      success: true,
      message: generateFallbackResponse(messages, systemPrompt),
      model: 'fallback-ai',
      cached: false,
      fallback: true,
    };
  }
  
  // Try multiple models with rotation
  let lastError = null;
  const maxAttempts = Math.min(10, ALL_MODELS.length); // Try up to 10 models
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const model = getNextModel();
    const apiKey = getNextApiKey();
    
    if (!apiKey) {
      console.warn('⚠️  No valid API key available');
      continue;
    }
    
    try {
      console.log(`🤖 Attempting AI request with model: ${model} (Attempt ${attempt + 1}/${maxAttempts})`);
      
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: fullMessages,
          max_tokens: maxTokens,
          temperature: temperature,
          top_p: topP,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.APP_URL || 'https://estatoprop.com',
            'X-Title': 'Estato Property Assistant',
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );
      
      const assistantMessage = response.data.choices[0].message.content;
      
      // Mark model and key as successful
      markModelSuccess(model);
      markKeySuccess(apiKey);
      
      // Cache the response
      if (useCache) {
        const cacheKey = getCacheKey(messages, systemPrompt);
        responseCache.set(cacheKey, {
          message: assistantMessage,
          model: model,
          timestamp: Date.now(),
        });
      }
      
      console.log(`✅ AI request successful with model: ${model}`);
      
      return {
        success: true,
        message: assistantMessage,
        model: model,
        cached: false,
      };
      
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const errorMsg = error.response?.data?.error?.message || error.message;
      
      // Handle API key errors (401 = unauthorized/disabled key)
      if (status === 401) {
        console.log(`⚠️  API key unauthorized (disabled?), trying next key...`);
        markKeyFailed(apiKey);
        continue; // Try next key
      }
      
      // Check if it's a rate limit or unavailable error
      if (isRateLimitOrUnavailable(error)) {
        console.log(`⚠️ Model ${model} rate limited or unavailable, trying next model...`);
        markModelFailed(model);
        markKeyFailed(apiKey);
        continue; // Try next model
      }
      
      // For other errors, log and try next model
      console.error(`❌ Error with model ${model}:`, errorMsg);
      markModelFailed(model);
      
      // If it's a 4xx error (except rate limit and auth), don't retry
      if (status >= 400 && status < 500 && status !== 429 && status !== 401) {
        break;
      }
    }
  }
  
  // All models failed
  console.error('❌ All AI models failed');
  
  // Check if it's an API key issue
  const isAuthError = lastError?.response?.status === 401 || 
                      lastError?.message?.includes('401') ||
                      lastError?.message?.includes('Unauthorized');
  
  if (isAuthError) {
    console.warn('⚠️  OpenRouter API keys are invalid. Using fallback AI response.');
    
    // Return a helpful fallback response
    const fallbackMessage = generateFallbackResponse(messages, systemPrompt);
    
    return {
      success: true,
      message: fallbackMessage,
      model: 'fallback-ai',
      cached: false,
      fallback: true,
    };
  }
  
  return {
    success: false,
    error: 'All AI models are currently unavailable. Please try again later.',
    details: lastError?.response?.data?.error?.message || lastError?.message,
  };
}

/**
 * Generate fallback AI response when API keys fail
 */
function generateFallbackResponse(messages, systemPrompt) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  // Property-related keywords
  if (lastMessage.includes('property') || lastMessage.includes('ghar') || lastMessage.includes('flat')) {
    return `Namaste! Main Estato AI hoon. Aapko property dhoondhne mein madad kar sakta hoon. 

Lucknow mein humara database bahut bada hai - apartments, villas, PG, commercial spaces sab kuch available hai.

Aap mujhe bata sakte hain:
- Aapka budget kya hai?
- Kaun sa area pasand hai? (Gomti Nagar, Hazratganj, Indira Nagar, etc.)
- Kitne BHK chahiye?
- Buy karna hai ya rent pe lena hai?

Main aapko best options suggest karunga! 🏠`;
  }
  
  if (lastMessage.includes('price') || lastMessage.includes('cost') || lastMessage.includes('kitna')) {
    return `Lucknow mein property prices area ke hisaab se alag hoti hain:

📍 **Premium Areas:**
- Gomti Nagar: ₹4,000-8,000/sq ft (buy), ₹15,000-30,000/month (rent)
- Hazratganj: ₹3,500-7,000/sq ft (buy), ₹12,000-25,000/month (rent)

📍 **Mid-Range Areas:**
- Indira Nagar: ₹3,000-5,500/sq ft (buy), ₹10,000-20,000/month (rent)
- Aliganj: ₹2,800-5,000/sq ft (buy), ₹8,000-18,000/month (rent)

📍 **Budget-Friendly:**
- Alambagh: ₹2,000-4,000/sq ft (buy), ₹6,000-12,000/month (rent)

Aapko kis area mein property chahiye? 🏘️`;
  }
  
  if (lastMessage.includes('area') || lastMessage.includes('location') || lastMessage.includes('kahan')) {
    return `Lucknow ke popular areas:

🌟 **Best for Families:**
- Gomti Nagar - Modern, well-planned
- Indira Nagar - Established, good schools
- Jankipuram - Affordable, growing fast

🏢 **Best for Professionals:**
- Hazratganj - Central, commercial hub
- Aliganj - Good connectivity
- Mahanagar - Near IT parks

🎓 **Best for Students:**
- Alambagh - Budget-friendly PGs
- Aminabad - Central location
- Near universities

Aapko kaun sa area pasand aayega? 📍`;
  }
  
  if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('namaste')) {
    return `Namaste! 🙏 Main Estato AI hoon - Lucknow ka sabse smart property assistant!

Main aapki kaise madad kar sakta hoon?

✅ Property search (Buy/Rent/PG)
✅ Price guidance
✅ Area comparison
✅ EMI calculation
✅ Property recommendations

Bas mujhe bataiye aapko kya chahiye! 🏠`;
  }
  
  // Default helpful response
  return `Main Estato AI hoon, Lucknow ke properties ke baare mein aapki madad ke liye!

Aap mujhse pooch sakte hain:
- "Gomti Nagar mein 2BHK flat dikhao"
- "₹20 lakh budget mein kya milega?"
- "Hazratganj vs Indira Nagar comparison"
- "EMI calculator"

Kya aapko koi specific property chahiye? 🏡`;
}

/**
 * Get available models info
 */
function getModelsInfo() {
  return {
    totalModels: ALL_MODELS.length,
    currentModel: lastSuccessfulModel,
    modelsByTier: {
      tier1: FREE_AI_MODELS.tier1.length,
      tier2: FREE_AI_MODELS.tier2.length,
      tier3: FREE_AI_MODELS.tier3.length,
      tier4: FREE_AI_MODELS.tier4.length,
      tier5: FREE_AI_MODELS.tier5.length,
    },
    failures: Object.fromEntries(modelFailures),
  };
}

/**
 * Clear cache (for admin use)
 */
function clearCache() {
  responseCache.clear();
  console.log('🗑️ AI response cache cleared');
}

/**
 * Reset model failures (for admin use)
 */
function resetFailures() {
  modelFailures.clear();
  currentModelIndex = 0;
  lastSuccessfulModel = ALL_MODELS[0];
  console.log('🔄 Model failures reset');
}

module.exports = {
  sendChatMessage,
  getModelsInfo,
  clearCache,
  resetFailures,
  ALL_MODELS,
};

