# AI Models Configuration for Estato

## 15 Free AI Models with Dedicated API Keys

### Meta LLaMA Models
1. **meta-llama/llama-3.2-3b-instruct:free**
   - API Key: `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`

2. **meta-llama/llama-3.3-70b-instruct:free**
   - API Key: `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`

### Mistral Models
3. **mistralai/mistral-7b-instruct:free** (Key 1)
   - API Key: `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`

4. **mistralai/mistral-7b-instruct:free** (Key 2)
   - API Key: `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`

5. **mistralai/devstral-2512:free**
   - API Key: `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`

### Google Gemma Models
6. **google/gemma-3-4b-it:free**
   - API Key: `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`

7. **google/gemma-3-27b-it:free**
   - API Key: `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`

8. **google/gemma-3-12b-it:free**
   - API Key: `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`

### Qwen Model
9. **qwen/qwen-2.5-vl-7b-instruct:free**
   - API Key: `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`

### Nous Research
10. **nousresearch/hermes-2-pro-llama-3-8b**
    - API Key: `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`

### Allen AI
11. **allenai/olmo-3.1-32b-think:free**
    - API Key: `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`

### Xiaomi
12. **xiaomi/mimo-v2-flash:free**
    - API Key: `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`

### NVIDIA
13. **nvidia/nemotron-3-nano-30b-a3b:free**
    - API Key: `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`

### Nex AGI
14. **nex-agi/deepseek-v3.1-nex-n1:free**
    - API Key: `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`

### Arcee AI
15. **arcee-ai/trinity-mini:free**
    - API Key: `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`

---

## Add to .env file:

```env
# AI Models and API Keys
OPENROUTER_KEY_LLAMA_3B=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
OPENROUTER_KEY_LLAMA_70B=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
OPENROUTER_KEY_MISTRAL_1=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
OPENROUTER_KEY_MISTRAL_2=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
OPENROUTER_KEY_DEVSTRAL=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
OPENROUTER_KEY_GEMMA_4B=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
OPENROUTER_KEY_GEMMA_27B=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
OPENROUTER_KEY_GEMMA_12B=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
OPENROUTER_KEY_QWEN=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
OPENROUTER_KEY_HERMES=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
OPENROUTER_KEY_OLMO=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
OPENROUTER_KEY_MIMO=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
OPENROUTER_KEY_NEMOTRON=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
OPENROUTER_KEY_DEEPSEEK=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
OPENROUTER_KEY_TRINITY=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
```

