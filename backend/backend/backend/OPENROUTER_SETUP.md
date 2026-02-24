# OpenRouter API Key Setup Guide

## ⚠️ Security Notice
**NEVER commit API keys to code!** All keys must be set as environment variables.

## 🔑 Getting New API Keys

1. Go to [OpenRouter Keys Page](https://openrouter.ai/keys)
2. Click "Create Key"
3. Name it (e.g., "Estato Production 1")
4. Copy the key (starts with `sk-or-v1-...`)
5. Repeat to create multiple keys for rotation (recommended: 3-5 keys)

## 🚀 Setting Up in Render

### Option 1: Single API Key
1. Go to Render Dashboard → Your Service → Environment
2. Add environment variable:
   - Key: `OPENROUTER_API_KEY`
   - Value: `sk-or-v1-your-key-here`

### Option 2: Multiple Keys (Recommended for Rotation)
1. Go to Render Dashboard → Your Service → Environment
2. Add multiple environment variables:
   - `OPENROUTER_API_KEY_1` = `sk-or-v1-first-key`
   - `OPENROUTER_API_KEY_2` = `sk-or-v1-second-key`
   - `OPENROUTER_API_KEY_3` = `sk-or-v1-third-key`
   - (up to `OPENROUTER_API_KEY_20`)

3. Click "Save Changes"
4. Redeploy the service

## 🔄 How Key Rotation Works

The backend automatically:
1. Loads all configured keys on startup
2. Rotates between keys on each request
3. Tracks which keys are failing (401, 429 errors)
4. Skips failed keys temporarily
5. Auto-recovers keys after 5 minutes

## 🛡️ Fallback System

If NO API keys are configured or ALL keys fail:
- The system uses intelligent fallback responses
- Users still get helpful property-related answers
- No errors shown to users
- Logs show warnings for admin to fix

## ✅ Verification

After setting up keys in Render:

1. Check Render logs for:
   ```
   🔑 OpenRouter API: X key(s) loaded from environment
   ```

2. Test the AI chat in the app

3. If you see this warning, keys aren't configured:
   ```
   ⚠️  WARNING: No API keys found! AI chat will use fallback responses.
   ```

## 📊 Monitoring

Check Render logs for:
- `✅ AI request successful with model: ...` = Working
- `⚠️  API key unauthorized` = Key disabled/invalid
- `⚠️ Model rate limited` = Normal, will auto-switch

## 🆓 Free Models Used

The system uses these free OpenRouter models:
- meta-llama/llama-3.3-70b-instruct:free
- google/gemma-3-27b-it:free
- mistralai/mistral-7b-instruct:free
- And 30+ more fallbacks

All models are free tier = **$0 cost**!

## 🔒 Security Best Practices

1. ✅ Store keys ONLY in Render environment variables
2. ✅ Never commit keys to Git
3. ✅ Use multiple keys for redundancy
4. ✅ Rotate keys periodically
5. ✅ Monitor for unauthorized usage alerts from OpenRouter

