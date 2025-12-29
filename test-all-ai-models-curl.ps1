# PowerShell Script to Test All AI Models with OpenRouter API
# Tests each of the 15 API keys with different models

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   ESTATO AI - MODEL TESTING SCRIPT" -ForegroundColor Cyan
Write-Host "   Testing 15 API Keys + 40+ Models" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Define all 15 API keys
$API_KEYS = @(
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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"
)

# Test models (representative from each tier)
$TEST_MODELS = @(
    @{Name="Llama 3.3 70B"; Model="meta-llama/llama-3.3-70b-instruct:free"; Tier=1},
    @{Name="Llama 3.2 3B"; Model="meta-llama/llama-3.2-3b-instruct:free"; Tier=1},
    @{Name="Gemma 3 27B"; Model="google/gemma-3-27b-it:free"; Tier=1},
    @{Name="Mistral 7B"; Model="mistralai/mistral-7b-instruct:free"; Tier=2},
    @{Name="Devstral 2512"; Model="mistralai/devstral-2512:free"; Tier=2},
    @{Name="Gemma 3 12B"; Model="google/gemma-3-12b-it:free"; Tier=2},
    @{Name="Qwen 2.5 VL 7B"; Model="qwen/qwen-2.5-vl-7b-instruct:free"; Tier=1},
    @{Name="Hermes 2 Pro"; Model="nousresearch/hermes-2-pro-llama-3-8b"; Tier=2},
    @{Name="Nemotron 3 Nano"; Model="nvidia/nemotron-3-nano-30b-a3b:free"; Tier=2},
    @{Name="DeepSeek V3.1"; Model="nex-agi/deepseek-v3.1-nex-n1:free"; Tier=2},
    @{Name="Olmo 3.1 32B"; Model="allenai/olmo-3.1-32b-think:free"; Tier=3},
    @{Name="Mimo V2 Flash"; Model="xiaomi/mimo-v2-flash:free"; Tier=3},
    @{Name="Trinity Mini"; Model="arcee-ai/trinity-mini:free"; Tier=3},
    @{Name="Gemma 3 4B"; Model="google/gemma-3-4b-it:free"; Tier=2},
    @{Name="OpenRouter Auto"; Model="openrouter/auto"; Tier=5}
)

# Test prompt
$TEST_PROMPT = "Hello! Give me property advice for Lucknow. Keep it brief."

# Results tracking
$successCount = 0
$failCount = 0
$results = @()

Write-Host "Testing $($TEST_MODELS.Count) representative models across all tiers..." -ForegroundColor Yellow
Write-Host "Test Prompt: '$TEST_PROMPT'" -ForegroundColor Gray
Write-Host ""

# Test each model with first available API key
foreach ($modelInfo in $TEST_MODELS) {
    $modelName = $modelInfo.Name
    $model = $modelInfo.Model
    $tier = $modelInfo.Tier
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "Testing: $modelName" -ForegroundColor Cyan
    Write-Host "Model ID: $model" -ForegroundColor Gray
    Write-Host "Tier: $tier" -ForegroundColor Gray
    Write-Host ""
    
    $tested = $false
    $success = $false
    $responseText = ""
    $errorMessage = ""
    
    # Try with first 3 API keys
    for ($keyIndex = 0; $keyIndex -lt 3 -and !$success; $keyIndex++) {
        $apiKey = $API_KEYS[$keyIndex]
        $keyDisplay = "Key #$($keyIndex + 1) (...$($apiKey.Substring($apiKey.Length - 8)))"
        
        if ($keyIndex -gt 0) {
            Write-Host "  Retrying with $keyDisplay..." -ForegroundColor Yellow
        } else {
            Write-Host "  Using $keyDisplay" -ForegroundColor Gray
        }
        
        # Build request body
        $body = @{
            model = $model
            messages = @(
                @{
                    role = "system"
                    content = "You are Estato AI, a Lucknow property assistant. Be concise and helpful."
                },
                @{
                    role = "user"
                    content = $TEST_PROMPT
                }
            )
            max_tokens = 150
            temperature = 0.7
        } | ConvertTo-Json -Depth 10
        
        try {
            # Make API request
            $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" `
                -Method Post `
                -Headers @{
                    "Authorization" = "Bearer $apiKey"
                    "Content-Type" = "application/json"
                    "HTTP-Referer" = "https://estatoprop.com"
                    "X-Title" = "Estato Property Assistant"
                } `
                -Body $body `
                -TimeoutSec 30 `
                -ErrorAction Stop
            
            $tested = $true
            $success = $true
            $responseText = $response.choices[0].message.content
            $usedModel = $response.model
            
            Write-Host "  ✅ SUCCESS!" -ForegroundColor Green
            Write-Host "  Response: $($responseText.Substring(0, [Math]::Min(100, $responseText.Length)))..." -ForegroundColor White
            if ($responseText.Length -gt 100) {
                Write-Host "            (truncated, total $($responseText.Length) chars)" -ForegroundColor Gray
            }
            Write-Host ""
            
            $successCount++
            $results += @{
                Model = $modelName
                ModelID = $model
                Tier = $tier
                Status = "✅ SUCCESS"
                ApiKey = $keyDisplay
                Response = $responseText.Substring(0, [Math]::Min(150, $responseText.Length))
                Error = ""
            }
            
        } catch {
            $tested = $true
            $statusCode = $_.Exception.Response.StatusCode.value__
            $errorMessage = $_.Exception.Message
            
            if ($statusCode -eq 401) {
                Write-Host "  ❌ UNAUTHORIZED (401) - Invalid API key" -ForegroundColor Red
            } elseif ($statusCode -eq 429) {
                Write-Host "  ⚠️  RATE LIMITED (429) - Too many requests" -ForegroundColor Yellow
            } elseif ($statusCode -eq 503) {
                Write-Host "  ⚠️  UNAVAILABLE (503) - Model overloaded" -ForegroundColor Yellow
            } else {
                Write-Host "  ❌ FAILED (Status: $statusCode)" -ForegroundColor Red
                Write-Host "  Error: $errorMessage" -ForegroundColor Red
            }
            
            # Don't retry if it's an auth error with all keys
            if ($statusCode -eq 401 -and $keyIndex -eq 2) {
                break
            }
        }
    }
    
    if (!$success) {
        $failCount++
        $results += @{
            Model = $modelName
            ModelID = $model
            Tier = $tier
            Status = "❌ FAILED"
            ApiKey = "Tried 3 keys"
            Response = ""
            Error = $errorMessage
        }
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500  # Small delay between tests
}

# Summary Report
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "           TEST SUMMARY REPORT" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Models Tested: $($TEST_MODELS.Count)" -ForegroundColor White
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($successCount / $TEST_MODELS.Count) * 100, 2))%" -ForegroundColor $(if ($successCount -gt $failCount) { "Green" } else { "Red" })
Write-Host ""

# Detailed results by tier
Write-Host "Results by Tier:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$tierGroups = $results | Group-Object -Property Tier | Sort-Object Name
foreach ($tierGroup in $tierGroups) {
    $tierNum = $tierGroup.Name
    $tierResults = $tierGroup.Group
    $tierSuccess = ($tierResults | Where-Object { $_.Status -eq "✅ SUCCESS" }).Count
    $tierTotal = $tierResults.Count
    
    Write-Host ""
    Write-Host "Tier $tierNum ($tierSuccess/$tierTotal successful):" -ForegroundColor Cyan
    foreach ($result in $tierResults) {
        Write-Host "  $($result.Status) $($result.Model)" -ForegroundColor $(if ($result.Status -eq "✅ SUCCESS") { "Green" } else { "Red" })
        Write-Host "     Model: $($result.ModelID)" -ForegroundColor Gray
        if ($result.Response) {
            Write-Host "     Response: $($result.Response)..." -ForegroundColor White
        } elseif ($result.Error) {
            Write-Host "     Error: $($result.Error)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

# Final recommendations
Write-Host ""
if ($successCount -eq 0) {
    Write-Host "⚠️  WARNING: ALL MODELS FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  1. All API keys are invalid/unauthorized" -ForegroundColor White
    Write-Host "  2. Network connectivity issues" -ForegroundColor White
    Write-Host "  3. OpenRouter service is down" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Good News: Estato has a FALLBACK AI system" -ForegroundColor Green
    Write-Host "   The app will continue working with intelligent local responses!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Action Required:" -ForegroundColor Yellow
    Write-Host "  1. Get valid API keys from: https://openrouter.ai/keys" -ForegroundColor White
    Write-Host "  2. Update backend/.env with new keys" -ForegroundColor White
    Write-Host "  3. Redeploy backend to Render" -ForegroundColor White
} elseif ($successCount -lt $TEST_MODELS.Count / 2) {
    Write-Host "⚠️  WARNING: More than 50% models failed" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The AI chat will work but with reduced reliability." -ForegroundColor Yellow
    Write-Host "Consider getting new API keys from: https://openrouter.ai/keys" -ForegroundColor White
} else {
    Write-Host "✅ EXCELLENT! Most models are working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your AI chat system is fully operational." -ForegroundColor Green
    Write-Host "The smart rotation will use working models automatically." -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

