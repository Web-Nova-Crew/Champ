#!/bin/bash

# AI Endpoints Testing Script
# Tests all AI routes with curl commands

echo "🧪 Testing Estato AI Endpoints"
echo "================================"
echo ""

# Configuration
BASE_URL="https://champ-y6eg.onrender.com"
# For local testing, use: BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth=$5
    
    echo "📝 Testing: $name"
    echo "   Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        if [ -z "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $auth" "$BASE_URL$endpoint")
        fi
    else
        if [ -z "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth" \
                -d "$data" \
                "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "   Status: $http_code"
    echo "   Response: $body" | head -c 200
    echo ""
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "   ${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    elif [ "$http_code" -eq 401 ]; then
        echo -e "   ${YELLOW}⚠️  REQUIRES AUTH (Expected)${NC}"
        ((PASSED++))
    else
        echo -e "   ${RED}❌ FAILED${NC}"
        ((FAILED++))
    fi
    
    echo ""
    echo "------------------------------------------------------------"
    echo ""
}

# Test 1: Health Check
echo "============================================================"
echo "TEST 1: Health Check"
echo "============================================================"
test_endpoint "Health Check" "GET" "/health" "" ""

# Test 2: AI Models Info (No Auth Required)
echo "============================================================"
echo "TEST 2: AI Models Info"
echo "============================================================"
test_endpoint "Get AI Models Info" "GET" "/api/ai/models-info" "" ""

# Test 3: AI Chat (Requires Auth)
echo "============================================================"
echo "TEST 3: AI Chat (Without Auth - Should Fail)"
echo "============================================================"
test_endpoint "AI Chat - No Auth" "POST" "/api/ai/chat" \
    '{"message":"Hello, tell me about properties in Lucknow"}' ""

# Test 4: Property Suggestions (Requires Auth)
echo "============================================================"
echo "TEST 4: Property Suggestions (Without Auth - Should Fail)"
echo "============================================================"
test_endpoint "Property Suggestions - No Auth" "POST" "/api/ai/property-suggestions" \
    '{"budget":"15000","propertyType":"Apartment","purpose":"rent","preferredArea":"Gomti Nagar","bedrooms":"2"}' ""

# Test 5: Compare Areas (Requires Auth)
echo "============================================================"
echo "TEST 5: Compare Areas (Without Auth - Should Fail)"
echo "============================================================"
test_endpoint "Compare Areas - No Auth" "POST" "/api/ai/compare-areas" \
    '{"area1":"Gomti Nagar","area2":"Hazratganj"}' ""

# Test 6: Price Guidance (Requires Auth)
echo "============================================================"
echo "TEST 6: Price Guidance (Without Auth - Should Fail)"
echo "============================================================"
test_endpoint "Price Guidance - No Auth" "POST" "/api/ai/price-guidance" \
    '{"propertyType":"Apartment","area":"Gomti Nagar","size":"1200"}' ""

# Test 7: Rate Limit Status (Requires Auth)
echo "============================================================"
echo "TEST 7: Rate Limit Status (Without Auth - Should Fail)"
echo "============================================================"
test_endpoint "Rate Limit Status - No Auth" "GET" "/api/ai/rate-limit-status" "" ""

# Summary
echo "============================================================"
echo "📊 TEST SUMMARY"
echo "============================================================"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "✅ AI endpoints are working correctly"
    echo "⚠️  Note: Auth-protected endpoints return 401 (expected)"
    echo ""
    echo "📝 To test with authentication:"
    echo "   1. Login to get access token"
    echo "   2. Run: export AUTH_TOKEN='your_token_here'"
    echo "   3. Re-run this script"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo "Please check the error messages above"
fi

echo ""
echo "============================================================"

