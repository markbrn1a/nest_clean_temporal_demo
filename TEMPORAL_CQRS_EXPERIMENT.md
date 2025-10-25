# Temporal-Native CQRS Payment Experiment

This experiment demonstrates the Temporal-native approach to CQRS where workflows act as aggregates, eliminating the need for traditional event sourcing infrastructure.

## Key Concepts

### Traditional CQRS vs Temporal-Native CQRS

**Traditional CQRS (existing implementation):**

- CommandBus/QueryBus
- External event store
- Event handlers
- Projection builders
- Complex saga coordination

**Temporal-Native CQRS (new implementation):**

- Workflows as aggregates
- Signals as commands
- Queries as read operations
- Built-in event sourcing via workflow history
- No external event store needed

## API Endpoints

### New Temporal-Native Endpoints (`/temporal-payments`)

#### 1. Create Payment (Starts Workflow)

```bash
POST /temporal-payments
Content-Type: application/json

{
  "userId": "user-123",
  "amount": 100.00,
  "currency": "USD",
  "customerId": "customer-456",
  "description": "Test payment"
}
```

#### 2. Get Payment State (Query Workflow)

```bash
GET /temporal-payments/{paymentId}
```

#### 3. Get Payment Status

```bash
GET /temporal-payments/{paymentId}/status
```

#### 4. Get Payment History (Event Sourcing)

```bash
GET /temporal-payments/{paymentId}/history
```

#### 5. Process Payment (Signal)

```bash
POST /temporal-payments/{paymentId}/process
Content-Type: application/json

{
  "paymentMethod": "credit_card",
  "metadata": {
    "gateway": "stripe"
  }
}
```

#### 6. Update Payment Status (Signal)

```bash
PATCH /temporal-payments/{paymentId}/status
Content-Type: application/json

{
  "status": "COMPLETED",
  "reason": "Manual completion"
}
```

#### 7. Cancel Payment (Signal)

```bash
POST /temporal-payments/{paymentId}/cancel
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}
```

#### 8. Refund Payment (Signal)

```bash
POST /temporal-payments/{paymentId}/refund
Content-Type: application/json

{
  "amount": 50.00,
  "reason": "Partial refund requested"
}
```

#### 9. Check Business Rules (Queries)

```bash
GET /temporal-payments/{paymentId}/refundable
GET /temporal-payments/{paymentId}/cancellable
```

#### 10. Terminate Workflow (Cleanup)

```bash
DELETE /temporal-payments/{paymentId}/workflow?reason=Testing%20complete
```

## Testing Workflow

### 1. Start Temporal Server

```bash
# Terminal 1
temporal server start-dev
```

### 2. Start the Application

```bash
# Terminal 2
npm run start:dev
```

### 3. Test the Flow

#### Create a payment:

```bash
curl -X POST http://localhost:3000/temporal-payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "amount": 100.00,
    "currency": "USD",
    "description": "Test temporal payment"
  }'
```

Response:

```json
{
  "paymentId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowId": "payment-aggregate-550e8400-e29b-41d4-a716-446655440000",
  "status": "created",
  "message": "Payment aggregate workflow started"
}
```

#### Check payment state:

```bash
curl http://localhost:3000/temporal-payments/550e8400-e29b-41d4-a716-446655440000
```

#### View payment history (built-in event sourcing):

```bash
curl http://localhost:3000/temporal-payments/550e8400-e29b-41d4-a716-446655440000/history
```

#### Process the payment:

```bash
curl -X POST http://localhost:3000/temporal-payments/550e8400-e29b-41d4-a716-446655440000/process \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "credit_card"
  }'
```

#### Check if payment is refundable:

```bash
curl http://localhost:3000/temporal-payments/550e8400-e29b-41d4-a716-446655440000/refundable
```

#### Refund the payment:

```bash
curl -X POST http://localhost:3000/temporal-payments/550e8400-e29b-41d4-a716-446655440000/refund \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "reason": "Customer requested partial refund"
  }'
```

## Key Differences in Implementation

### Traditional CQRS Flow:

1. HTTP Request → Controller
2. Controller → CommandBus
3. CommandHandler → Repository → Database
4. CommandHandler → EventBus
5. EventHandler → External effects
6. Saga → Temporal workflow (if needed)

### Temporal-Native CQRS Flow:

1. HTTP Request → Controller
2. Controller → TemporalService.signalWorkflow()
3. Workflow receives signal → Updates internal state
4. Query operations read directly from workflow state
5. Built-in event sourcing via workflow history

## Benefits Observed

1. **Simplified Architecture**: No external event store, no projection builders
2. **Built-in Event Sourcing**: Workflow history provides complete audit trail
3. **State Consistency**: Workflow guarantees consistent state transitions
4. **Business Logic Centralization**: All payment logic in one workflow
5. **Durability**: Workflow survives process restarts
6. **Debugging**: Rich debugging through Temporal UI

## Architecture Comparison

### Files Added for Temporal-Native CQRS:

- `payment-aggregate.workflow.ts` - The aggregate as workflow
- `payment-aggregate.service.ts` - Service to interact with workflow
- `temporal-payment.controller.ts` - New controller for temporal endpoints

### Files NOT Needed with Temporal-Native:

- No additional event handlers
- No projection builders
- No external event store configuration
- No complex saga coordination

## Monitoring

Visit the Temporal UI at http://localhost:8233 to see:

- Workflow executions
- Signal history
- Query operations
- Workflow state
- Complete event timeline

## Comparison with Traditional CQRS

The traditional CQRS endpoints still work at `/payments`, allowing you to compare:

1. Traditional create: `POST /payments`
2. Temporal create: `POST /temporal-payments`

Both achieve the same business outcome but with different architectural approaches.
