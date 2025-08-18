#!/bin/bash

# ESA LIFE CEO 61x21 - Platform Validation Script
# Following the comprehensive test plan without requiring browser installation

echo "🚀 ESA LIFE CEO 61x21 - Platform Validation"
echo "============================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5000"
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Got $response, expected $expected_status)"
        ((FAILED++))
        return 1
    fi
}

# Function to test API with data
test_api_data() {
    local endpoint=$1
    local description=$2
    local check_field=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s "$BASE_URL$endpoint")
    
    if echo "$response" | grep -q "$check_field"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Missing expected data)"
        ((FAILED++))
        return 1
    fi
}

echo "📋 Layer 1-10: Core Infrastructure"
echo "=================================="
test_endpoint "/" "Homepage loads"
test_endpoint "/memories" "Memories page"
test_endpoint "/community" "Community page"
test_endpoint "/groups" "Groups page"
test_endpoint "/events" "Events page"
test_endpoint "/messages" "Messages page"
test_endpoint "/friends" "Friends page"
test_endpoint "/admin" "Admin center"
echo ""

echo "📋 Layer 11-20: API Endpoints"
echo "============================="
test_api_data "/api/auth/user" "Auth user endpoint" "id"
test_api_data "/api/posts" "Posts API" "success"
test_api_data "/api/groups" "Groups API" "data"
test_api_data "/api/events" "Events API" "success"
test_api_data "/api/friends" "Friends API" "success"
echo ""

echo "📋 Layer 57: City Group Automation"
echo "=================================="
test_api_data "/api/community/city-groups" "City groups endpoint" "Buenos Aires"
test_api_data "/api/community/city-groups" "Tokyo city group" "Tokyo"
test_api_data "/api/community/city-groups" "Paris city group" "Paris"
test_api_data "/api/community/city-groups" "Tirana city group" "Tirana"
echo ""

echo "📋 Layer 21-30: Social Features"
echo "==============================="
test_api_data "/api/posts" "Posts feed" "success"
test_api_data "/api/reactions" "Reactions API" "success"
test_api_data "/api/comments" "Comments API" "success"
echo ""

echo "📋 Layer 31-40: Real-time Features"
echo "=================================="
test_endpoint "/socket.io/" "WebSocket endpoint" "400"  # Socket.io returns 400 without proper connection
test_api_data "/api/notifications" "Notifications API" "success"
echo ""

echo "📋 Layer 41-50: Admin & Security"
echo "================================"
test_api_data "/api/admin/stats" "Admin statistics" "totalUsers"
test_endpoint "/api/admin/users" "Admin users endpoint"
test_endpoint "/api/admin/content" "Admin content moderation"
echo ""

echo "📋 Layer 51-60: Advanced Features"
echo "================================="
test_api_data "/api/automation/status" "Automation status" "cityGroups"
test_api_data "/api/statistics/global" "Global statistics" "data"
test_endpoint "/api/search" "Search functionality"
echo ""

echo "📋 Performance Validation"
echo "========================"
echo -n "Testing API response time... "
start_time=$(date +%s%N)
curl -s "$BASE_URL/api/community/city-groups" > /dev/null
end_time=$(date +%s%N)
response_time=$(((end_time - start_time) / 1000000))

if [ $response_time -lt 1000 ]; then
    echo -e "${GREEN}✓ PASSED${NC} (${response_time}ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ SLOW${NC} (${response_time}ms)"
fi

echo ""
echo "📋 Data Integrity Check"
echo "======================"
echo -n "Verifying real city data... "
cities=$(curl -s "$BASE_URL/api/community/city-groups" | jq -r '.data[].city' 2>/dev/null | tr '\n' ', ')
if [ ! -z "$cities" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "  Found cities: $cities"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo -n "Verifying member counts... "
member_count=$(curl -s "$BASE_URL/api/community/city-groups" | jq '.data[0].memberCount' 2>/dev/null)
if [ "$member_count" -gt 0 ] 2>/dev/null; then
    echo -e "${GREEN}✓ PASSED${NC} (Buenos Aires: $member_count members)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "============================================"
echo "📊 ESA LIFE CEO 61x21 Validation Results"
echo "============================================"
echo -e "✅ Passed: ${GREEN}$PASSED${NC}"
echo -e "❌ Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "The platform meets ESA LIFE CEO 61x21 requirements!"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️ Some tests failed. Review the results above.${NC}"
    exit 1
fi