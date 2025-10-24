# Temporal Workflow Testing Guide

This document outlines the comprehensive testing strategy for our NestJS + Temporal application.

## Testing Strategy Overview

Our testing approach covers multiple layers:

1. **Unit Tests** - Individual components in isolation
2. **Workflow Tests** - Temporal workflow logic using `@temporalio/testing`
3. **Integration Tests** - End-to-end flow from HTTP to database
4. **Manual Testing** - Real-world scenarios

## Test Structure

```
src/
├── contexts/onboarding/presentation/http/
│   └── onboarding.controller.spec.ts           # Controller unit tests
├── contexts/user/infrastructure/temporal/workflows/
│   └── create-user-with-address.workflow.spec.ts  # Workflow tests
└── shared/integration/sagas/
    └── onboarding.saga.spec.ts                 # Saga unit tests

test/
└── onboarding-e2e.spec.ts                      # E2E integration tests
```

## Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPattern="onboarding"

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Using Test Script

```bash
./test-temporal.sh
```

## Test Types Explained

### 1. Unit Tests

#### Controller Tests (`onboarding.controller.spec.ts`)

- ✅ **Event Publishing**: Verifies `UserOnboardingRequestedEvent` is published
- ✅ **Request Validation**: Tests handling of valid/invalid payloads
- ✅ **Error Handling**: Ensures proper error responses
- ✅ **Default Values**: Tests company name defaults

#### Saga Tests (`onboarding.saga.spec.ts`)

- ✅ **Event Processing**: Verifies saga receives and processes events
- ✅ **Workflow Triggering**: Tests Temporal workflow start calls
- ✅ **Error Handling**: Tests duplicate workflow and error scenarios
- ✅ **Logging**: Verifies proper logging behavior

### 2. Workflow Tests

#### Workflow Logic Tests (`create-user-with-address.workflow.spec.ts`)

- ✅ **Happy Path**: Complete workflow execution with mocked activities
- ✅ **Validation Failures**: Tests early workflow termination
- ✅ **Activity Sequencing**: Verifies correct activity call order
- ✅ **Data Flow**: Tests data passing between activities

**Key Features:**

- Uses `@temporalio/testing` for isolated workflow testing
- Mocks all activities for deterministic testing
- Tests workflow logic without external dependencies

### 3. Integration Tests

#### End-to-End Tests (`onboarding-e2e.spec.ts`)

- ✅ **Complete Flow**: HTTP → Event → Saga → Workflow → Database
- ✅ **Database Validation**: Verifies entities are created correctly
- ✅ **Error Scenarios**: Tests validation failures and duplicates
- ✅ **Timeout Handling**: Tests long-running workflows

**Test Scenarios:**

1. **Successful Onboarding**: Full user creation with address and customer
2. **Invalid Email**: Tests validation failure handling
3. **Missing Fields**: Tests request validation
4. **Duplicate Emails**: Tests business rule enforcement
5. **Workflow Status**: Demonstrates workflow monitoring

## Test Data Management

### Database Cleanup

```typescript
beforeEach(async () => {
  // Clean up database before each test
  await prismaService.address.deleteMany();
  await prismaService.customer.deleteMany();
  await prismaService.user.deleteMany();
});
```

### Mock Data Patterns

```typescript
const mockUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  companyName: 'Tech Corp',
  address: {
    street: '123 Main St',
    city: 'New York',
    zipCode: '10001',
    country: 'USA',
  },
};
```

## Testing Best Practices

### 1. Temporal Testing

- ✅ Use `@temporalio/testing` for workflow tests
- ✅ Mock all activities for unit tests
- ✅ Test workflow logic, not activity implementations
- ✅ Use separate task queues for each test

### 2. Saga Testing

- ✅ Test event handling in isolation
- ✅ Mock external dependencies (TemporalService)
- ✅ Verify error handling paths
- ✅ Test async operations with proper waiting

### 3. Integration Testing

- ✅ Test the complete flow from HTTP to database
- ✅ Use real database with cleanup between tests
- ✅ Test both success and failure scenarios
- ✅ Include reasonable timeouts for workflows

### 4. Assertion Patterns

#### Event Assertions

```typescript
expect(eventBus.publish).toHaveBeenCalledWith(
  expect.objectContaining({
    eventType: 'UserOnboardingRequested',
    requestId: expect.any(String),
    userData: expect.objectContaining({
      name: 'John Doe',
      email: 'john.doe@example.com',
    }),
  }),
);
```

#### Workflow Assertions

```typescript
expect(mockActivities.createUser).toHaveBeenCalledWith({
  name: 'John Doe',
  email: 'john.doe@example.com',
  addressId: 'address-123',
});
```

#### Database Assertions

```typescript
const users = await prismaService.user.findMany({
  where: { email: 'john.doe@test.com' },
  include: { address: true },
});

expect(users).toHaveLength(1);
expect(users[0]).toMatchObject({
  name: 'John Doe',
  email: 'john.doe@test.com',
  address: expect.objectContaining({
    street: '123 Test St',
    city: 'Test City',
  }),
});
```

## Common Testing Patterns

### 1. Mock Setup

```typescript
const mockTemporalService = {
  startWorkflow: jest.fn().mockResolvedValue('workflow-id'),
};
```

### 2. Async Testing

```typescript
// Give time for async operations
await new Promise((resolve) => setTimeout(resolve, 100));
```

### 3. Error Testing

```typescript
temporalService.startWorkflow.mockRejectedValue(
  new Error('Workflow execution already started'),
);
```

## Debugging Tests

### Console Output

Tests include strategic console.log statements for debugging:

```typescript
console.log('OnboardingSaga: Starting Temporal workflow', { workflowId });
```

### Test Isolation

Each test is isolated with:

- Database cleanup
- Fresh mock setup
- Unique test data

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Tests
  run: |
    npm test
    npm run test:e2e
    npm run test:cov
```

### Test Commands

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

## Coverage Goals

Target coverage metrics:

- **Functions**: 90%+
- **Lines**: 85%+
- **Branches**: 80%+
- **Statements**: 85%+

## Future Enhancements

1. **Property-based Testing**: Use libraries like `fast-check`
2. **Contract Testing**: API contract validation
3. **Performance Testing**: Workflow execution time benchmarks
4. **Chaos Testing**: Random failure injection
5. **Visual Regression**: Workflow diagram testing

## Troubleshooting

### Common Issues

1. **Temporal Worker Not Starting**: Ensure proper workflow paths
2. **Database Connection**: Check test database configuration
3. **Async Timing**: Increase timeout values for slow tests
4. **Mock Isolation**: Ensure mocks are reset between tests

### Debug Commands

```bash
# Run single test with debug output
npm run test:debug -- --testNamePattern="should complete workflow"

# Run with verbose output
npm test -- --verbose

# Run specific file
npm test -- onboarding.saga.spec.ts
```
