#!/bin/bash

echo "🧪 Testing Temporal-Native CQRS Payment Experiment"
echo "================================================="

BASE_URL="http://localhost:3000"
PAYMENT_ID=""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Creating a payment using Temporal-native CQRS${NC}"
RESPONSE=$(curl -s -X POST ${BASE_URL}/temporal-payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "amount": 100.00,
    "currency": "USD",
    "description": "Temporal CQRS test payment"
  }')

echo "Response: $RESPONSE"
PAYMENT_ID=$(echo $RESPONSE | grep -o '"paymentId":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ Payment created with ID: $PAYMENT_ID${NC}"
echo ""

if [ -z "$PAYMENT_ID" ]; then
  echo "❌ Failed to create payment. Exiting."
  exit 1
fi

sleep 2

echo -e "${BLUE}Step 2: Querying payment state from workflow${NC}"
curl -s ${BASE_URL}/temporal-payments/${PAYMENT_ID} | jq '.'
echo ""

sleep 1

echo -e "${BLUE}Step 3: Getting payment status${NC}"
curl -s ${BASE_URL}/temporal-payments/${PAYMENT_ID}/status | jq '.'
echo ""

sleep 1

echo -e "${BLUE}Step 4: Viewing payment history (built-in event sourcing)${NC}"
curl -s ${BASE_URL}/temporal-payments/${PAYMENT_ID}/history | jq '.'
echo ""

sleep 2

echo -e "${BLUE}Step 5: Processing the payment (sending signal)${NC}"
curl -s -X POST ${BASE_URL}/temporal-payments/${PAYMENT_ID}/process \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "credit_card",
    "metadata": {
      "gateway": "stripe",
      "test": true
    }
  }' | jq '.'
echo ""

sleep 3

echo -e "${BLUE}Step 6: Checking updated payment state${NC}"
curl -s ${BASE_URL}/temporal-payments/${PAYMENT_ID} | jq '.'
echo ""

sleep 1

echo -e "${BLUE}Step 7: Checking if payment is refundable${NC}"
curl -s ${BASE_URL}/temporal-payments/${PAYMENT_ID}/refundable | jq '.'
echo ""

sleep 1

echo -e "${BLUE}Step 8: Partial refund (sending signal)${NC}"
curl -s -X POST ${BASE_URL}/temporal-payments/${PAYMENT_ID}/refund \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 30.00,
    "reason": "Customer requested partial refund"
  }' | jq '.'
echo ""

sleep 2

echo -e "${BLUE}Step 9: Viewing complete payment history after refund${NC}"
curl -s ${BASE_URL}/temporal-payments/${PAYMENT_ID}/history | jq '.'
echo ""

sleep 1

echo -e "${BLUE}Step 10: Final payment state${NC}"
curl -s ${BASE_URL}/temporal-payments/${PAYMENT_ID} | jq '.'
echo ""

echo -e "${GREEN}✅ Temporal-Native CQRS Payment Test Complete!${NC}"
echo ""
echo -e "${YELLOW}Key Observations:${NC}"
echo "• Payment state managed entirely within Temporal workflow"
echo "• Commands sent as signals to workflow"
echo "• Queries read directly from workflow state"
echo "• Complete event history available via built-in event sourcing"
echo "• No external event store or projection building required"
echo ""
echo -e "${YELLOW}Visit Temporal UI at http://localhost:8233 to see:${NC}"
echo "• Workflow execution: payment-aggregate-${PAYMENT_ID}"
echo "• Signal history and state transitions"
echo "• Complete audit trail"