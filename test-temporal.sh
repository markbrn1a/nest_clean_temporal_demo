#!/bin/bash

echo "🧪 Running Temporal Workflow Tests"
echo "=================================="

# Start with unit tests
echo "📝 Running Unit Tests..."
npm test -- --testPathPattern="onboarding.saga.spec.ts|onboarding.controller.spec.ts"

echo ""
echo "🔄 Running Workflow Tests..."
npm test -- --testPathPattern="create-user-with-address.workflow.spec.ts"

echo ""
echo "🌐 Running E2E Integration Tests..."
npm run test:e2e -- --testPathPattern="onboarding-e2e.spec.ts"

echo ""
echo "📊 Running All Tests with Coverage..."
npm run test:cov

echo ""
echo "✅ Test Suite Complete!"