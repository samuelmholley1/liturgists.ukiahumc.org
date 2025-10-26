#!/bin/bash

# Test script for identifying which handler actually processes requests
# Based on user's debugging checklist

DOMAIN="https://liturgists.ukiahumc.org"
TEST_RECORD_ID="recTestID123"

echo "======================================"
echo "HANDLER IDENTIFICATION TESTS"
echo "======================================"
echo ""

echo "1️⃣  Testing DELETE method directly:"
echo "curl -i -X DELETE \"$DOMAIN/api/signup?recordId=$TEST_RECORD_ID\""
echo ""
curl -i -X DELETE "$DOMAIN/api/signup?recordId=$TEST_RECORD_ID" 2>&1 | head -40
echo ""
echo "--------------------------------------"
echo ""

echo "2️⃣  Testing GET method with action=cancel:"
echo "curl -i \"$DOMAIN/api/signup?action=cancel&recordId=$TEST_RECORD_ID\""
echo ""
curl -i "$DOMAIN/api/signup?action=cancel&recordId=$TEST_RECORD_ID" 2>&1 | head -40
echo ""
echo "--------------------------------------"
echo ""

echo "3️⃣  Testing POST method with JSON body:"
echo "curl -i -X POST \"$DOMAIN/api/signup\" -H \"content-type: application/json\" --data '{\"action\":\"cancel\",\"recordId\":\"$TEST_RECORD_ID\"}'"
echo ""
curl -i -X POST "$DOMAIN/api/signup" \
  -H "content-type: application/json" \
  --data "{\"action\":\"cancel\",\"recordId\":\"$TEST_RECORD_ID\"}" 2>&1 | head -40
echo ""
echo "--------------------------------------"
echo ""

echo "✅ Check the X-Handler header in each response above!"
echo "✅ The 'tag' field will tell you which handler actually ran:"
echo "   - signup.DELETE = DELETE handler"
echo "   - signup.GET = GET handler"  
echo "   - signup.POST = POST handler"
echo ""
