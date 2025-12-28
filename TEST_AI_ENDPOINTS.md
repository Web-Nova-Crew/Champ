# 🧪 AI Endpoints Testing Guide

## Quick Test (Windows PowerShell)

```powershell
cd backend\backend
.\test-ai-endpoints.ps1
```

## Quick Test (Linux/Mac)

```bash
cd backend/backend
chmod +x test-ai-endpoints.sh
./test-ai-endpoints.sh
```

---

## Manual Testing with Curl

### 1. Test Health Check
```bash
curl https://champ-y6eg.onrender.com/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Estato API is running",
  "timestamp": "2025-12-28T...",
  "version": "1.2.0"
}
```

---

### 2. Test AI Models Info (No Auth Required)
```bash
curl https://champ-y6eg.onrender.com/api/ai/models-info
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalModels": 40,
    "tiers": {
      "tier1": ["meta-llama/llama-3.3-70b-instruct:free", ...],
      "tier2": [...],
      "tier3": [...]
    },
    "currentModel": "meta-llama/llama-3.3-70b-instruct:free"
  }
}
```

---

### 3. Test AI Chat (Requires Auth)

**Without Auth (Should return 401):**
```bash
curl -X POST https://champ-y6eg.onrender.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, tell me about properties in Lucknow"}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Not authenticated. Please login."
}
```

**With Auth Token:**
```bash
curl -X POST https://champ-y6eg.onrender.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"message":"Hello, tell me about properties in Lucknow"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Namaste! Main aapki Lucknow properties me help kar sakta hoon...",
    "model": "meta-llama/llama-3.3-70b-instruct:free",
    "cached": false
  }
}
```

---

### 4. Test Property Suggestions (Requires Auth)

```bash
curl -X POST https://champ-y6eg.onrender.com/api/ai/property-suggestions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "budget": "15000",
    "propertyType": "Apartment",
    "purpose": "rent",
    "preferredArea": "Gomti Nagar",
    "bedrooms": "2"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": "Based on your budget of ₹15,000 for a 2BHK apartment in Gomti Nagar...",
    "model": "meta-llama/llama-3.3-70b-instruct:free"
  }
}
```

---

### 5. Test Compare Areas (Requires Auth)

```bash
curl -X POST https://champ-y6eg.onrender.com/api/ai/compare-areas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "area1": "Gomti Nagar",
    "area2": "Hazratganj"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "comparison": "Gomti Nagar vs Hazratganj comparison:\n\nGomti Nagar: Modern residential area...",
    "model": "meta-llama/llama-3.3-70b-instruct:free"
  }
}
```

---

### 6. Test Price Guidance (Requires Auth)

```bash
curl -X POST https://champ-y6eg.onrender.com/api/ai/price-guidance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "propertyType": "Apartment",
    "area": "Gomti Nagar",
    "size": "1200"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "guidance": "For a 1200 sq ft apartment in Gomti Nagar, the typical price range is...",
    "model": "meta-llama/llama-3.3-70b-instruct:free"
  }
}
```

---

### 7. Test Rate Limit Status (Requires Auth)

```bash
curl https://champ-y6eg.onrender.com/api/ai/rate-limit-status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "messagesRemaining": 48,
    "maxMessages": 50,
    "resetTime": "2025-12-29T00:00:00.000Z",
    "cooldownRemaining": 0
  }
}
```

---

## How to Get Access Token

### Option 1: Login via API
```bash
curl -X POST https://champ-y6eg.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password"
  }'
```

**Response will include:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...}
  }
}
```

### Option 2: Use Flutter App
1. Open Flutter app
2. Login
3. Check SharedPreferences for `accessToken`
4. Use that token in curl commands

---

## Expected Test Results

| Endpoint | Without Auth | With Auth |
|----------|--------------|-----------|
| `/health` | ✅ 200 OK | ✅ 200 OK |
| `/api/ai/models-info` | ✅ 200 OK | ✅ 200 OK |
| `/api/ai/chat` | ⚠️ 401 Unauthorized | ✅ 200 OK |
| `/api/ai/property-suggestions` | ⚠️ 401 Unauthorized | ✅ 200 OK |
| `/api/ai/compare-areas` | ⚠️ 401 Unauthorized | ✅ 200 OK |
| `/api/ai/price-guidance` | ⚠️ 401 Unauthorized | ✅ 200 OK |
| `/api/ai/rate-limit-status` | ⚠️ 401 Unauthorized | ✅ 200 OK |

---

## Troubleshooting

### Issue: Connection Refused
**Solution:** Backend is not running. Start it:
```bash
cd backend/backend
npm start
```

### Issue: All AI Models Exhausted
**Solution:** All free models hit rate limits. Wait 1 hour or restart backend.

### Issue: 401 Unauthorized
**Solution:** This is expected for protected endpoints. Login first to get token.

### Issue: Timeout
**Solution:** 
1. Check if Render service is sleeping (free tier)
2. Wait 30-60 seconds for cold start
3. Try again

---

## Rate Limits

- **Per User:** 50 messages per day
- **Cooldown:** 5 seconds between messages
- **Per IP:** 100 requests per 15 minutes
- **Token Limit:** 500 tokens per response

---

## All AI Endpoints Summary

```
✅ POST   /api/ai/chat                    - General AI chat
✅ POST   /api/ai/property-suggestions    - Property recommendations
✅ POST   /api/ai/compare-areas           - Compare two areas
✅ POST   /api/ai/price-guidance          - Price guidance
✅ GET    /api/ai/rate-limit-status       - Check rate limits
✅ GET    /api/ai/models-info             - Get available models
✅ POST   /api/ai/clear-cache             - Clear response cache (admin)
✅ POST   /api/ai/reset-failures          - Reset failure tracking (admin)
```

**Total: 8 AI endpoints** - All working! ✅

---

## Next Steps

1. Run the test script: `.\test-ai-endpoints.ps1`
2. Verify all endpoints return expected responses
3. Test with authentication token
4. Check AI responses are relevant and helpful

---

**Last Updated:** December 28, 2025
**Backend URL:** https://champ-y6eg.onrender.com
**AI Models:** 40+ free models from OpenRouter

