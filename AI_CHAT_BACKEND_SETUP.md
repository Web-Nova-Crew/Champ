# 🤖 AI Chat Backend Setup & Troubleshooting

## ✅ Current Status

The AI chat backend is **FULLY CONFIGURED** and ready to use. Here's what's already set up:

### Backend Configuration ✓
- ✅ AI proxy service with 30+ free models (`backend/backend/services/ai-proxy.js`)
- ✅ Smart model rotation (Tier 1 → Tier 2 → Tier 3)
- ✅ Rate limiting (50 messages/day per user, 5-second cooldown)
- ✅ AI routes configured (`/api/ai/chat`, `/api/ai/property-suggestions`, etc.)
- ✅ Server routes loaded (`backend/backend/server.js`)

### Flutter App Configuration ✓
- ✅ AI chat service (`lib/services/ai_chat_service.dart`)
- ✅ API client with AI methods (`lib/services/api_client.dart`)
- ✅ API endpoints configured:
  - `POST /api/ai/chat` - General AI chat
  - `POST /api/ai/property-suggestions` - Property recommendations
  - `POST /api/ai/compare-areas` - Area comparisons
  - `POST /api/ai/price-guidance` - Price guidance

---

## 🔧 If AI Chat is Not Working

### Issue 1: Backend Not Running
**Symptom:** "Request timeout" or "Network error"

**Solution:**
1. **Check if backend is deployed on Render:**
   - Go to https://dashboard.render.com
   - Find your service (should be `champ-y6eg.onrender.com`)
   - Check if it's "Live" (green status)

2. **If backend is not deployed:**
   ```bash
   cd backend/backend
   npm install
   npm start
   ```

3. **Test backend health:**
   - Open browser: `https://champ-y6eg.onrender.com/health`
   - Should return: `{"status": "ok", "message": "Server is running"}`

---

### Issue 2: Wrong Backend URL in Flutter App
**Symptom:** "Request timeout" even though backend is running

**Solution:**
Update the backend URL in Flutter app:

**File:** `lib/services/config_service.dart`
```dart
// API Configuration
static const String baseUrl = 'https://champ-y6eg.onrender.com/api';
static const String apiBaseUrl = 'https://champ-y6eg.onrender.com/api';
```

**Or if running backend locally:**
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
// OR
static const String baseUrl = 'http://localhost:3000/api'; // iOS simulator
```

**After changing:**
```bash
flutter clean
flutter pub get
flutter run
```

---

### Issue 3: Missing Environment Variables on Render
**Symptom:** Backend crashes or AI routes return errors

**Solution:**
1. Go to Render Dashboard → Your Service → Environment Tab
2. Add these variables:
   ```
   PORT=10000
   NODE_ENV=production
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   ALLOWED_ORIGINS=*
   ```

3. **For AI models (optional - uses free models by default):**
   ```
   OPENROUTER_API_KEY_1=sk-or-v1-...
   OPENROUTER_API_KEY_2=sk-or-v1-...
   ...
   OPENROUTER_API_KEY_15=sk-or-v1-...
   ```

4. Save and redeploy

---

### Issue 4: Rate Limit Exceeded
**Symptom:** "Rate limit exceeded" error

**Solution:**
- Each user can send 50 messages per day
- 5-second cooldown between messages
- Wait a few seconds or try again tomorrow
- Check rate limit status: `GET /api/ai/rate-limit-status`

---

### Issue 5: All AI Models Failing
**Symptom:** "All AI models exhausted" error

**Solution:**
This means all 30+ free models hit rate limits. This is rare but can happen.

**Quick fix:**
1. **Backend:** Restart the service to reset failure tracking
2. **Or wait:** Models auto-recover after 1 hour
3. **Or clear cache:**
   ```bash
   # On backend server
   curl -X POST http://localhost:3000/api/ai/clear-cache
   ```

---

## 🧪 Testing AI Chat

### Test 1: Check Backend Health
```bash
curl https://champ-y6eg.onrender.com/health
```
Expected: `{"status": "ok"}`

### Test 2: Check AI Models Info
```bash
curl https://champ-y6eg.onrender.com/api/ai/models-info
```
Expected: List of available models

### Test 3: Send Test Message (requires auth token)
```bash
curl -X POST https://champ-y6eg.onrender.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Hello, tell me about Lucknow properties"}'
```

### Test 4: From Flutter App
1. Open AI Chat screen in app
2. Send message: "Hello"
3. Should get response within 5-10 seconds

---

## 📊 AI Chat Architecture

```
Flutter App (lib/screens/ai_chat)
         ↓
AI Chat Service (lib/services/ai_chat_service.dart)
         ↓
API Client (lib/services/api_client.dart)
         ↓
Backend API (backend/backend/routes/ai.js)
         ↓
AI Proxy Service (backend/backend/services/ai-proxy.js)
         ↓
OpenRouter API (30+ Free Models)
```

---

## 🔑 AI Models Configured

### Tier 1 (Best Quality - Try First)
1. meta-llama/llama-3.2-3b-instruct:free
2. meta-llama/llama-3.3-70b-instruct:free
3. mistralai/mistral-7b-instruct:free
4. qwen/qwen-2.5-vl-7b-instruct:free
5. google/gemma-3-4b-it:free
6. google/gemma-3-27b-it:free
7. google/gemma-3-12b-it:free
8. nousresearch/hermes-2-pro-llama-3-8b
9. allenai/olmo-3.1-32b-think:free
10. xiaomi/mimo-v2-flash:free
11. nvidia/nemotron-3-nano-30b-a3b:free
12. mistralai/devstral-2512:free
13. nex-agi/deepseek-v3.1-nex-n1:free
14. arcee-ai/trinity-mini:free
15. x-ai/grok-beta

### Tier 2 (Stable Fallback)
- meta-llama/llama-3.1-8b-instruct:free
- mistralai/mixtral-8x7b-instruct:free
- qwen/qwen-2.5-7b-instruct:free
- google/gemma-2-9b-it:free
- nousresearch/nous-hermes-2-mixtral:free

### Tier 3 (Emergency Fallback)
- microsoft/phi-3-mini-4k-instruct:free
- openchat/openchat-7b:free
- deepseek/deepseek-chat:free
- huggingfaceh4/zephyr-7b-beta:free

**Total: 35+ free models with automatic rotation!**

---

## 🚀 Quick Start

### For Development (Local Backend)
```bash
# Terminal 1: Start backend
cd backend/backend
npm install
npm start

# Terminal 2: Run Flutter app
flutter run
```

### For Production (Render Backend)
1. Ensure backend is deployed on Render
2. Update `lib/services/config_service.dart` with Render URL
3. Run Flutter app:
   ```bash
   flutter run --release
   ```

---

## 📞 Support

If AI chat still doesn't work after following this guide:

1. **Check backend logs on Render Dashboard**
2. **Check Flutter app logs:** `flutter logs`
3. **Verify network connectivity**
4. **Try with a different device/emulator**

---

## ✅ Checklist

- [ ] Backend is running (check health endpoint)
- [ ] Backend URL is correct in `config_service.dart`
- [ ] Environment variables are set on Render
- [ ] User is logged in (AI routes require authentication)
- [ ] Not hitting rate limits (50 messages/day)
- [ ] Internet connection is working

---

**Last Updated:** December 28, 2025
**Backend Version:** 1.0.0
**AI Models:** 35+ free models from OpenRouter

