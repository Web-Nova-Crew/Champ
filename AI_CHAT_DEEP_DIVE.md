# 🧠 AI Chat Integration - Deep Technical Architecture

## **Overview**
The Estato AI Chat system is a **3-tier architecture** with intelligent model rotation, fallback handling, and rate limiting to ensure continuous AI availability even with free API keys.

---

## **🏗️ Architecture Flow**

```
User → Flutter App → ApiClient → Backend API → AI Proxy → OpenRouter → AI Models
                                       ↓
                                  Fallback AI (if all fail)
```

---

## **📦 Component Breakdown**

### **1. Frontend (Flutter)**

#### **a) AIChatScreen** (`lib/screens/chat/ai_chat_screen.dart`)
**Purpose**: User interface for chat interactions

**Key Features**:
- Message list with user/bot bubbles
- Typing indicator while AI processes
- Quick action buttons for common queries
- Auto-scroll to latest message
- Error handling with user-friendly messages

**Flow**:
1. User types message
2. Message added to UI immediately
3. Loading indicator shown
4. Call `AIChatService.sendMessage()`
5. Display AI response
6. Handle errors gracefully

#### **b) AIChatService** (`lib/services/ai_chat_service.dart`)
**Purpose**: Business logic layer between UI and API

**Key Features**:
- Maintains conversation history (last 10 messages)
- Calls `ApiClient` for network requests
- Manages state (loading, errors)
- Provides specialized methods:
  - `sendMessage()` - General chat
  - `getPropertySuggestions()` - AI property recommendations
  - `compareAreas()` - Area comparison
  - `getPriceGuidance()` - Price estimates

**Conversation History Management**:
```dart
_conversationHistory = [
  {'role': 'user', 'content': 'Hello'},
  {'role': 'assistant', 'content': 'Namaste!'},
  {'role': 'user', 'content': 'Show me 2BHK'},
  // ... keeps last 10 messages
]
```

#### **c) ApiClient** (`lib/services/api_client.dart`)
**Purpose**: HTTP communication layer

**AI Endpoints**:
- `POST /api/ai/chat` - Main chat endpoint
- `POST /api/ai/property-suggestions` - Property recommendations
- `POST /api/ai/compare-areas` - Area comparison
- `POST /api/ai/price-guidance` - Price guidance
- `GET /api/ai/rate-limit-status` - Check rate limits

**Request Format** (POST /api/ai/chat):
```json
{
  "message": "Show me properties in Gomti Nagar",
  "conversationHistory": [
    {"role": "user", "content": "previous message"},
    {"role": "assistant", "content": "previous response"}
  ],
  "systemPrompt": "You are Estato AI...",
  "options": {
    "maxTokens": 400,
    "temperature": 0.6,
    "topP": 0.9
  }
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "message": "AI response text...",
    "model": "meta-llama/llama-3.3-70b-instruct:free",
    "cached": false
  }
}
```

---

### **2. Backend (Node.js + Express)**

#### **a) AI Routes** (`backend/backend/routes/ai.js`)
**Purpose**: API endpoints for AI functionality

**Middleware Chain**:
1. `aiIpRateLimit` - IP-based rate limiting (prevents abuse)
2. `authenticateToken` - JWT authentication (user must be logged in)
3. `aiUserRateLimit` - User-specific rate limiting
4. Route handler → calls `ai-proxy.js`

**Rate Limits**:
- **Per User**: 20 requests per 15 minutes
- **Per IP**: 50 requests per 15 minutes
- Prevents abuse and reduces costs

**Key Routes**:
- `POST /api/ai/chat` - Main chat (validated input, max 2000 chars)
- `POST /api/ai/property-suggestions` - Structured property queries
- `POST /api/ai/compare-areas` - Compare two locations
- `POST /api/ai/price-guidance` - Get price estimates
- `GET /api/ai/models-info` - See which models are working
- `GET /api/ai/rate-limit-status` - Check your usage

#### **b) AI Proxy Service** (`backend/backend/services/ai-proxy.js`)
**Purpose**: Core AI intelligence - handles model rotation and fallback

**🔑 Key Features**:

##### **1. Multiple API Keys (15 keys)**
```javascript
const API_KEYS = [
  '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',
  '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',
  // ... 13 more keys
];

// Rotates through keys on each request
function getNextApiKey() {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}
```

##### **2. 40+ Free AI Models (Tiered)**
```javascript
FREE_AI_MODELS = {
  tier1: [  // Best quality, tried first
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    // ... 5 more
  ],
  tier2: [  // Stable & reliable fallbacks
    'mistralai/mistral-7b-instruct:free',
    'google/gemma-3-12b-it:free',
    // ... 11 more
  ],
  tier3: [  // Good fallbacks
    'allenai/olmo-3.1-32b-think:free',
    // ... 7 more
  ],
  tier4: [  // Lightweight fallbacks
    'undi95/toppy-m-7b:free',
    // ... 5 more
  ],
  tier5: [  // Emergency fallbacks
    'openrouter/auto',
    // ... 4 more
  ]
}
```

##### **3. Smart Model Rotation Algorithm**
```javascript
// Tracks which models are failing
modelFailures = Map {
  'meta-llama/llama-3.3-70b-instruct:free': 0,
  'mistralai/mistral-7b-instruct:free': 2,
  // ...
}

function getNextModel() {
  // 1. Try last successful model first
  if (lastSuccessfulModel && failures < 3) {
    return lastSuccessfulModel;
  }
  
  // 2. Find model with least failures
  while (attempts < ALL_MODELS.length) {
    const model = ALL_MODELS[currentModelIndex];
    const failures = modelFailures.get(model) || 0;
    
    if (failures < 5) {
      return model; // Try this one
    }
    attempts++;
  }
  
  // 3. If all failing, reset and start over
  modelFailures.clear();
  return ALL_MODELS[0];
}
```

##### **4. Main Chat Function**
```javascript
async function sendChatMessage(messages, systemPrompt, options) {
  // 1. Check cache first (5 min TTL)
  const cached = responseCache.get(cacheKey);
  if (cached && !expired) {
    return cached; // Instant response!
  }
  
  // 2. Try up to 10 different models
  for (let attempt = 0; attempt < 10; attempt++) {
    const model = getNextModel();
    const apiKey = getNextApiKey();
    
    try {
      // 3. Call OpenRouter API
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 400,
          temperature: 0.6,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://estatoprop.com',
            'X-Title': 'Estato Property Assistant',
          },
          timeout: 30000, // 30 seconds
        }
      );
      
      // 4. Success! Cache and return
      const aiMessage = response.data.choices[0].message.content;
      markModelSuccess(model);
      responseCache.set(cacheKey, aiMessage);
      
      return {
        success: true,
        message: aiMessage,
        model: model,
        cached: false,
      };
      
    } catch (error) {
      // 5. Handle different error types
      if (isRateLimitError(error)) {
        markModelFailed(model);
        continue; // Try next model
      }
      
      if (error.status === 401) {
        // API key invalid, try next key/model
        continue;
      }
      
      // Other error, log and continue
      console.error(`Model ${model} failed:`, error.message);
      markModelFailed(model);
    }
  }
  
  // 6. All models failed - use FALLBACK AI
  return generateFallbackResponse(messages);
}
```

##### **5. Intelligent Fallback AI** 🚨 **CRITICAL FEATURE**
When all external AI models fail (invalid API keys, rate limits, outages), the system provides **context-aware responses** to keep the app functional:

```javascript
function generateFallbackResponse(messages) {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  // Detect user intent from keywords
  if (lastMessage.includes('property') || lastMessage.includes('ghar')) {
    return `Namaste! Main Estato AI hoon. 
    
Lucknow mein humara database bahut bada hai - apartments, villas, PG, commercial spaces sab kuch available hai.

Aap mujhe bata sakte hain:
- Aapka budget kya hai?
- Kaun sa area pasand hai? (Gomti Nagar, Hazratganj, Indira Nagar)
- Kitne BHK chahiye?

Main aapko best options suggest karunga! 🏠`;
  }
  
  if (lastMessage.includes('price') || lastMessage.includes('kitna')) {
    return `Lucknow mein property prices area ke hisaab se alag hoti hain:

📍 **Premium Areas:**
- Gomti Nagar: ₹4,000-8,000/sq ft (buy), ₹15,000-30,000/month (rent)
- Hazratganj: ₹3,500-7,000/sq ft (buy), ₹12,000-25,000/month (rent)

📍 **Mid-Range Areas:**
- Indira Nagar: ₹3,000-5,500/sq ft (buy), ₹10,000-20,000/month (rent)

Aapko kis area mein property chahiye? 🏘️`;
  }
  
  // ... more intelligent responses based on keywords
  
  return {
    success: true,
    message: fallbackMessage,
    model: 'fallback-ai', // Special identifier
    fallback: true,
  };
}
```

**Why Fallback AI is Brilliant**:
- ✅ App never breaks even with invalid API keys
- ✅ Users get helpful responses instead of errors
- ✅ Maintains app reputation and user trust
- ✅ Buys time to fix API key issues
- ✅ Context-aware (understands property, price, area queries)

##### **6. Response Caching**
```javascript
responseCache = Map {
  'key_user_message_123': {
    message: 'AI response...',
    model: 'llama-3.3-70b',
    timestamp: 1640000000000,
  }
}

// Cache for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

// Same question within 5 min = instant response!
```

##### **7. Failure Tracking & Auto-Recovery**
```javascript
// Each model tracks failures
markModelFailed(model) {
  failures = modelFailures.get(model) || 0;
  modelFailures.set(model, failures + 1);
  
  // Auto-reset after 10 minutes
  setTimeout(() => {
    modelFailures.set(model, failures - 1);
  }, 10 * 60 * 1000);
}

// Models with too many failures are skipped
if (modelFailures.get(model) >= 5) {
  skipModel();
}
```

---

## **🔄 Complete Request Flow**

### **Example: User asks "Show me 2BHK in Gomti Nagar"**

```
1. USER TYPES MESSAGE
   ↓
2. FLUTTER UI (AIChatScreen)
   - Adds message to UI
   - Shows loading indicator
   ↓
3. AICHATSERVICE (ai_chat_service.dart)
   - Adds to conversation history
   - Calls ApiClient.sendAIMessage()
   ↓
4. APICLIENT (api_client.dart)
   - Builds HTTP POST request
   - URL: https://your-backend.com/api/ai/chat
   - Headers: Authorization, Content-Type
   - Body: {message, conversationHistory, systemPrompt}
   ↓
5. BACKEND ROUTE (routes/ai.js)
   - aiIpRateLimit middleware (check IP limit)
   - authenticateToken (verify JWT)
   - aiUserRateLimit (check user limit)
   - Validate input (max 2000 chars)
   ↓
6. AI PROXY (services/ai-proxy.js)
   - Check cache (hit? return cached!)
   - Get next best model (based on success rate)
   - Get next API key (rotation)
   ↓
7. OPENROUTER API
   - POST https://openrouter.ai/api/v1/chat/completions
   - Model: meta-llama/llama-3.3-70b-instruct:free
   - Messages: [system prompt, ...history, user message]
   ↓
8. AI MODEL PROCESSING
   - LLaMA 3.3 70B generates response
   - Returns: "Gomti Nagar ek premium area hai..."
   ↓
9. AI PROXY (success handling)
   - markModelSuccess(model)
   - Cache response (5 min TTL)
   - Return to backend route
   ↓
10. BACKEND ROUTE
    - Format response JSON
    - Send to Flutter app
    ↓
11. APICLIENT
    - Parse JSON response
    - Return to AIChatService
    ↓
12. AICHATSERVICE
    - Add AI response to conversation history
    - Return to UI
    ↓
13. FLUTTER UI
    - Hide loading indicator
    - Display AI message in chat bubble
    - Auto-scroll to bottom
    ↓
14. USER SEES RESPONSE ✅
```

### **Error Scenario: All Models Fail**

```
6. AI PROXY tries 10 models...
   - Model 1: Rate limited (429) → try next
   - Model 2: API key invalid (401) → try next
   - Model 3: Unavailable (503) → try next
   - ... all 10 fail
   ↓
7. FALLBACK AI ACTIVATED
   - Analyzes user message keywords
   - Generates intelligent context-aware response
   - Returns with model: 'fallback-ai'
   ↓
8. USER GETS HELPFUL RESPONSE (not error!)
   - "Namaste! Main Estato AI hoon..."
   - App continues working normally
   - Developer can fix API keys meanwhile
```

---

## **🔒 Security & Rate Limiting**

### **Rate Limit Tiers**:
1. **IP-based**: 50 requests / 15 min (prevents DDoS)
2. **User-based**: 20 requests / 15 min (prevents abuse)
3. **Model-based**: Auto-rotation on rate limits

### **Authentication**:
- All AI endpoints require JWT token
- Token extracted from `Authorization: Bearer <token>` header
- Invalid token = 401 Unauthorized

### **Input Validation**:
- Max message length: 2000 characters
- Conversation history: Last 10 messages only
- System prompt: Sanitized and validated

---

## **💰 Cost Optimization**

### **1. Use Only Free Models**
All 40+ models have `:free` suffix = **$0 cost**

### **2. Response Caching**
Same question within 5 min = instant, no API call

### **3. Rate Limiting**
Prevents abuse, reduces unnecessary API calls

### **4. Token Limits**
Max 400-500 tokens per response = low usage

### **5. Smart Rotation**
Skip failing models, use successful ones = fewer retries

### **6. Fallback AI**
When all fail, use local logic = zero API cost

**Estimated Cost**: **$0/month** with free models! 🎉

---

## **📊 Monitoring & Debugging**

### **Backend Logs**:
```
🤖 Attempting AI request with model: meta-llama/llama-3.3-70b-instruct:free (Attempt 1/10)
✅ AI request successful with model: meta-llama/llama-3.3-70b-instruct:free
```

### **Check Model Status**:
```bash
curl https://your-backend.com/api/ai/models-info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "totalModels": 40,
    "currentModel": "meta-llama/llama-3.3-70b-instruct:free",
    "modelsByTier": {
      "tier1": 8,
      "tier2": 13,
      "tier3": 8,
      "tier4": 6,
      "tier5": 5
    },
    "failures": {
      "mistralai/mistral-7b-instruct:free": 2
    }
  }
}
```

### **Check Your Rate Limit**:
```bash
curl https://your-backend.com/api/ai/rate-limit-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## **🚀 Testing AI Chat**

### **Test from Flutter App**:
1. Open app → Navigate to AI Chat
2. Send message: "Hello"
3. Should get response in Hinglish

### **Test with curl** (see next section):
```bash
# Login first to get JWT token
curl -X POST https://your-backend.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"test123"}'

# Use token to test AI chat
curl -X POST https://your-backend.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Show me 2BHK flats in Gomti Nagar",
    "conversationHistory": []
  }'
```

---

## **🎯 Key Advantages of This Architecture**

### **1. High Availability**
- 40+ models = if one fails, try next
- 15 API keys = rotation prevents rate limits
- Fallback AI = never breaks

### **2. Performance**
- Response caching = instant replies for common questions
- Smart model selection = uses fastest working model
- Optimized token usage = low latency

### **3. Cost Efficiency**
- All free models = $0 cost
- Caching reduces API calls
- Rate limiting prevents abuse

### **4. User Experience**
- Always gets response (fallback AI)
- Fast responses (caching)
- Natural Hinglish language
- Context-aware (remembers last 10 messages)

### **5. Scalability**
- Can add more models easily
- Can add more API keys
- Rate limiting protects server
- Cache reduces server load

### **6. Maintainability**
- Clear separation of concerns
- Modular design (proxy, routes, services)
- Extensive logging
- Easy to debug

---

## **🔧 Configuration**

### **Backend Environment Variables** (`.env`):
```env
# OpenRouter API Keys (15 keys for rotation)
OPENROUTER_API_KEY_1=sk-or-v1-...
OPENROUTER_API_KEY_2=sk-or-v1-...
# ... up to 15

# App Info
APP_URL=https://estatoprop.com

# JWT Secret
JWT_SECRET=your-secret-key
```

### **Flutter Configuration** (`lib/core/constants/app_config.dart`):
```dart
class AppConfig {
  static const String baseUrl = 'https://your-backend.com';
  
  static const String aiSystemPrompt = '''
You are Estato AI - Lucknow's smartest real estate assistant.
You help users with property buying, selling, renting in Lucknow.
Be friendly, concise, and helpful. Use Hinglish when appropriate.
Keep responses under 300 words.
''';
}
```

---

## **📝 Summary**

The AI Chat integration is a **production-grade system** with:
- ✅ **3-tier architecture** (Flutter → Backend → OpenRouter)
- ✅ **40+ free AI models** with intelligent rotation
- ✅ **15 API keys** with automatic rotation
- ✅ **Fallback AI** that never lets the app break
- ✅ **Response caching** for instant replies
- ✅ **Rate limiting** to prevent abuse
- ✅ **Smart error handling** at every layer
- ✅ **Zero cost** with free models
- ✅ **High availability** with multiple fallbacks
- ✅ **Hinglish support** for local users

This architecture ensures **continuous AI functionality** even with invalid API keys or service outages! 🎉

