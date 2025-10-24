# NestJS Clean Architecture with Temporal Demo

TODO: FIX ISSUE WITH BG NODE PROCESS NOT SHOTING DOWN
A comprehensive NestJS application demonstrating **Clean Architecture** (Hexagonal Architecture) with **Temporal.io** workflow orchestration, **CQRS** pattern, and **Domain-Driven Design**.

## 🏗️ Architecture Overview

This project showcases:

- **Hexagonal Architecture** with clear separation of concerns
- **Domain-Driven Design** with bounded contexts (User, Customer, Payment)
- **CQRS** with Commands, Queries, and Event Handlers
- **Temporal.io** workflows for durable business process orchestration
- **Event-Driven Architecture** with Sagas coordinating workflows
- **Clean separation** between domain, application, infrastructure, and presentation layers

## 🚀 Features

- **User Onboarding Workflow**: Complete user registration with address creation and customer setup
- **Payment Processing Workflow**: Secure payment handling with validation and notifications
- **Customer Management Workflow**: Customer creation as part of business processes
- **Event-Driven Coordination**: Sagas bridge domain events to Temporal workflows
- **Database Integration**: Prisma ORM with SQLite for data persistence
- **Email Notifications**: Mock email service for workflow notifications

## 📋 Prerequisites

- Node.js 18+
- pnpm
- Docker (for Temporal server)

## 🛠️ Project Setup

```bash
# Install dependencies
$ pnpm install

# Set up database
$ npx prisma generate
$ npx prisma db push

# Start Temporal server (in separate terminal)
$ npx @temporalio/cli server start-dev

# Start the application
$ pnpm run start:dev
```

The application will start on `http://localhost:3000`

## 🧪 API Testing Examples

### 1. User Onboarding Workflow

Creates a complete user with address and customer profile through Temporal workflow orchestration.

**Endpoint:** `POST /users/onboard`

**Payload:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "companyName": "Acme Corp",
  "contactName": "John Doe"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/users/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "companyName": "Acme Corp",
    "contactName": "John Doe"
  }'
```

**Response:**

```json
{
  "eventId": "onboarding-1234567890-abcdef",
  "status": "onboarding_started",
  "message": "User onboarding event published. The onboarding workflow will be triggered by the saga."
}
```

### 2. Payment Processing Workflow

Processes payments with validation and email notifications through Temporal workflows.

**Endpoint:** `POST /payments/process`

**Payload:**

```json
{
  "userId": "7ddf91f6-1587-41cd-9cd5-3f238cb97022",
  "customerId": "99c7e708-c826-4ff3-ac91-214a667108ab",
  "amount": 100.0,
  "currency": "USD",
  "description": "Payment for services"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "7ddf91f6-1587-41cd-9cd5-3f238cb97022",
    "customerId": "99c7e708-c826-4ff3-ac91-214a667108ab",
    "amount": 100.00,
    "currency": "USD",
    "description": "Payment for services"
  }'
```

**Response:**

```json
{
  "eventId": "payment-1234567890-abcdef",
  "status": "processing_started",
  "message": "Payment processing event published. The payment workflow will be triggered by the saga."
}
```

### 3. CRUD Operations

#### Create User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  }'
```

#### Get User

```bash
curl -X GET http://localhost:3000/users/{userId}
```

#### List Users

```bash
curl -X GET http://localhost:3000/users
```

#### Create Payment

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "amount": 50.00,
    "currency": "USD",
    "description": "Direct payment creation"
  }'
```

## 🔄 Workflow Monitoring

You can monitor workflow execution in the Temporal Web UI:

- Open `http://localhost:8233` in your browser
- View running and completed workflows
- Inspect workflow history and activity logs
- Debug workflow execution steps

## 📁 Project Structure

```
src/
├── contexts/                 # Domain contexts (bounded contexts)
│   ├── user/                # User domain
│   │   ├── application/     # Commands, queries, handlers
│   │   ├── domain/          # Entities, value objects
│   │   ├── infrastructure/  # Repositories, temporal workflows
│   │   └── presentation/    # Controllers
│   ├── customer/            # Customer domain
│   └── payment/             # Payment domain
├── infrastructure/          # Shared infrastructure
│   ├── temporal/           # Temporal service and factory
│   ├── prisma/             # Database configuration
│   └── email/              # Email service
└── shared/                 # Shared utilities and modules
```

## 🧩 Key Components

### Temporal Workflows

- **userOnboardingWorkflow**: Orchestrates complete user onboarding
- **sendPaymentWorkflow**: Handles payment processing with validation
- **createCustomerWorkflow**: Manages customer creation

### Event-Driven Sagas

- **OnboardingSaga**: Listens to `StartUserOnboardingEvent` and triggers user workflow
- **PaymentSaga**: Listens to `StartPaymentProcessingEvent` and triggers payment workflow

### Domain Events

- **StartUserOnboardingEvent**: Initiated by user onboarding endpoint
- **StartPaymentProcessingEvent**: Initiated by payment processing endpoint

## 🔍 Debugging Tips

1. **Check Temporal Web UI** at `http://localhost:8233` for workflow status
2. **Monitor application logs** for saga and activity execution
3. **Verify database state** using Prisma Studio: `npx prisma studio`
4. **Use valid IDs** from successful workflows for dependent operations

## 🏃‍♂️ Quick Test Sequence

1. Start the onboarding workflow to create a complete user profile
2. Copy the generated `userId` and `customerId` from logs
3. Use those IDs to test the payment workflow
4. Monitor execution in Temporal Web UI

## 🧪 Testing

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

$ pnpm run test

# e2e tests

$ pnpm run test:e2e

# test coverage

$ pnpm run test:cov

````

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
````

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
