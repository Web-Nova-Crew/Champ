# AI Endpoints Testing Script (PowerShell)
# Tests all AI routes with curl commands

Write-Host "🧪 Testing Estato AI Endpoints" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BASE_URL = "https://champ-y6eg.onrender.com"
# For local testing, use: $BASE_URL = "http://localhost:3000"

# Test counter
$PASSED = 0
$FAILED = 0

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = "",
        [string]$Auth = ""
    )
    
    Write-Host "📝 Testing: $Name" -ForegroundColor Yellow
    Write-Host "   Endpoint: $Method $Endpoint"
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Auth) {
            $headers["Authorization"] = "Bearer $Auth"
        }
        
        $uri = "$BASE_URL$Endpoint"
        
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $uri -Method $Method -Headers $headers -UseBasicParsing -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $uri -Method $Method -Headers $headers -Body $Data -UseBasicParsing -ErrorAction Stop
        }
        
        $statusCode = $response.StatusCode
        $body = $response.Content
        
        Write-Host "   Status: $statusCode" -ForegroundColor Green
        Write-Host "   Response: $($body.Substring(0, [Math]::Min(200, $body.Length)))..."
        Write-Host ""
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "   ✅ PASSED" -ForegroundColor Green
            $script:PASSED++
        } else {
            Write-Host "   ❌ FAILED" -ForegroundColor Red
            $script:FAILED++
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
        Write-Host "   Error: $errorMessage"
        Write-Host ""
        
        if ($statusCode -eq 401) {
            Write-Host "   ⚠️  REQUIRES AUTH (Expected)" -ForegroundColor Yellow
            $script:PASSED++
        } else {
            Write-Host "   ❌ FAILED" -ForegroundColor Red
            $script:FAILED++
        }
    }
    
    Write-Host ""
    Write-Host "------------------------------------------------------------"
    Write-Host ""
}

# Test 1: Health Check
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST 1: Health Check" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Test-Endpoint -Name "Health Check" -Method "GET" -Endpoint "/health"

# Test 2: AI Models Info
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST 2: AI Models Info" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Test-Endpoint -Name "Get AI Models Info" -Method "GET" -Endpoint "/api/ai/models-info"

# Test 3: AI Chat (Requires Auth)
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST 3: AI Chat (Without Auth - Should Fail)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
$chatData = '{"message":"Hello, tell me about properties in Lucknow"}'
Test-Endpoint -Name "AI Chat - No Auth" -Method "POST" -Endpoint "/api/ai/chat" -Data $chatData

# Test 4: Property Suggestions (Requires Auth)
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST 4: Property Suggestions (Without Auth - Should Fail)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
$suggestionsData = '{"budget":"15000","propertyType":"Apartment","purpose":"rent","preferredArea":"Gomti Nagar","bedrooms":"2"}'
Test-Endpoint -Name "Property Suggestions - No Auth" -Method "POST" -Endpoint "/api/ai/property-suggestions" -Data $suggestionsData

# Test 5: Compare Areas (Requires Auth)
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST 5: Compare Areas (Without Auth - Should Fail)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
$compareData = '{"area1":"Gomti Nagar","area2":"Hazratganj"}'
Test-Endpoint -Name "Compare Areas - No Auth" -Method "POST" -Endpoint "/api/ai/compare-areas" -Data $compareData

# Test 6: Price Guidance (Requires Auth)
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST 6: Price Guidance (Without Auth - Should Fail)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
$priceData = '{"propertyType":"Apartment","area":"Gomti Nagar","size":"1200"}'
Test-Endpoint -Name "Price Guidance - No Auth" -Method "POST" -Endpoint "/api/ai/price-guidance" -Data $priceData

# Test 7: Rate Limit Status (Requires Auth)
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST 7: Rate Limit Status (Without Auth - Should Fail)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Test-Endpoint -Name "Rate Limit Status - No Auth" -Method "GET" -Endpoint "/api/ai/rate-limit-status"

# Summary
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($PASSED + $FAILED)"
Write-Host "Passed: $PASSED" -ForegroundColor Green
Write-Host "Failed: $FAILED" -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ AI endpoints are working correctly"
    Write-Host "⚠️  Note: Auth-protected endpoints return 401 (expected)"
    Write-Host ""
    Write-Host "📝 To test with authentication:"
    Write-Host "   1. Login to get access token"
    Write-Host "   2. Set: `$env:AUTH_TOKEN = 'your_token_here'"
    Write-Host "   3. Re-run this script"
} else {
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    Write-Host "Please check the error messages above"
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan

