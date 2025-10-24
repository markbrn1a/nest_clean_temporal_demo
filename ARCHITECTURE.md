# 🏗️ NestJS Clean Architecture with Temporal.io - Complete Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Project Structure](#project-structure)
4. [Core Concepts](#core-concepts)
5. [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
6. [CQRS (Command Query Responsibility Segregation)](#cqrs-command-query-responsibility-segregation)
7. [Event-Driven Architecture](#event-driven-architecture)
8. [Hexagonal Architecture](#hexagonal-architecture)
9. [Temporal.io Integration](#temporalio-integration)
10. [Implementation Patterns](#implementation-patterns)
11. [Development Guidelines](#development-guidelines)
12. [Examples](#examples)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)

---

## Overview

This project demonstrates a **Clean Architecture** implementation using **NestJS** with advanced patterns including:

- 🏛️ **Hexagonal Architecture** (Ports & Adapters)
- 🧠 **Domain-Driven Design** (DDD)
- ⚡ **CQRS** (Command Query Responsibility Segregation)
- 🔄 **Event-Driven Architecture**
- 🌊 **Temporal.io Workflows** for durable business processes
- 🎯 **Dependency Inversion Principle**

### Why This Architecture?

- **Maintainability**: Clear separation of concerns
- **Testability**: Easy to mock dependencies and test business logic
- **Scalability**: Independent scaling of read/write operations
- **Flexibility**: Easy to change infrastructure without affecting business logic
- **Durability**: Long-running processes that survive failures

---

## Architecture Patterns

### 1. Clean Architecture Layers

```
┌─────────────────┐
│   Presentation  │ ← Controllers, DTOs
├─────────────────┤
│   Application   │ ← Commands, Queries, Handlers
├─────────────────┤
│     Domain      │ ← Entities, Value Objects, Events
├─────────────────┤
│ Infrastructure  │ ← Repositories, External Services
└─────────────────┘
```

### 2. Dependency Flow

```
Presentation → Application → Domain
     ↓              ↓         ↑
Infrastructure ←────────────┘
```

**Rule**: Dependencies only flow inward. Domain layer has NO dependencies on outer layers.

---

## Project Structure

```
src/
├── contexts/                    # Bounded Contexts (DDD)
│   ├── user/                   # User Domain Context
│   │   ├── application/        # Application Services Layer
│   │   │   ├── commands/       # Write Operations
│   │   │   │   ├── create-user.command.ts
│   │   │   │   └── handlers/
│   │   │   │       └── create-user.handler.ts
│   │   │   ├── queries/        # Read Operations
│   │   │   │   ├── get-user.query.ts
│   │   │   │   └── handlers/
│   │   │   │       └── get-user.handler.ts
│   │   │   └── ports/          # Interface Contracts
│   │   │       └── user.repository.port.ts
│   │   ├── domain/             # Business Logic Layer
│   │   │   ├── entities/       # Aggregate Roots
│   │   │   │   └── user.entity.ts
│   │   │   ├── value-objects/  # Immutable Values
│   │   │   │   ├── user-id.vo.ts
│   │   │   │   └── email.vo.ts
│   │   │   ├── events/         # Domain Events
│   │   │   │   └── user-created.event.ts
│   │   │   └── exceptions/     # Domain Errors
│   │   │       └── user-already-exists.error.ts
│   │   ├── infrastructure/     # Technical Implementations
│   │   │   ├── adapters/       # Repository Implementations
│   │   │   │   └── prisma-user.repository.ts
│   │   │   └── temporal/       # Workflow Activities
│   │   │       └── user.activities.ts
│   │   └── presentation/       # External Interface
│   │       └── http/
│   │           └── user.controller.ts
│   ├── customer/               # Customer Domain Context
│   ├── payment/                # Payment Domain Context
│   └── address-management/     # Address Domain Context
├── infrastructure/             # Shared Infrastructure
│   ├── temporal/              # Temporal Service
│   ├── prisma/                # Database
│   └── email/                 # Email Service
└── shared/                    # Shared Components
    ├── domain/                # Common Domain Utilities
    │   └── base/
    │       └── aggregate-root.ts
    └── integration/           # Cross-Context Communication
        ├── domain-event-bus.interface.ts
        ├── nest-domain-event-bus.ts
        └── sagas/             # Event Orchestrators
            ├── customer.saga.ts
            └── user.saga.ts
```

---

## Core Concepts

### 🎯 Bounded Context

A **Bounded Context** is a logical boundary where a particular domain model applies. Each context has its own:

- **Ubiquitous Language**: Shared vocabulary within the context
- **Domain Model**: Entities, value objects, and business rules
- **Persistence**: Independent database schema
- **Team Ownership**: Separate team can own the context

**Example**: `user`, `customer`, `payment` are separate bounded contexts.

### 🏛️ Aggregate Root

An **Aggregate Root** is the main entity that maintains consistency within an aggregate boundary.

```typescript
export class Customer extends AggregateRoot {
  // Only the Customer can modify its internal state
  // Other entities cannot directly modify Customer data

  updateEmail(email: string): void {
    this.email = new Email(email);
    this.apply(new CustomerUpdatedEvent(/*...*/)); // Raises domain event
  }
}
```

### 💎 Value Object

**Value Objects** are immutable objects that represent a concept through their attributes.

```typescript
export class Email {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value.includes('@')) {
      throw new Error('Invalid email format');
    }
  }

  getValue(): string {
    return this.value;
  }
}
```

### 🔔 Domain Event

**Domain Events** represent something important that happened in the domain.

```typescript
export class CustomerCreatedEvent implements DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    // ... other properties
  ) {}
}
```

---

## Domain-Driven Design (DDD)

### Strategic Design

#### Bounded Contexts Map

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│    User     │    │   Customer   │    │   Payment   │
│   Context   │────│   Context    │────│   Context   │
└─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                  ┌─────────────────┐
                  │  Address Mgmt   │
                  │    Context      │
                  └─────────────────┘
```

#### Context Relationships

- **User** → **Customer**: One user can have multiple customers
- **Customer** → **Payment**: Customers make payments
- **Customer** → **Address**: Customers have addresses
- **User** → **Address**: Users have addresses

### Tactical Design

#### Entities vs Value Objects

| Entity              | Value Object     |
| ------------------- | ---------------- |
| Has identity        | No identity      |
| Mutable             | Immutable        |
| Has lifecycle       | Stateless        |
| Example: `Customer` | Example: `Email` |

#### Domain Services

Use when business logic doesn't belong to any specific entity:

```typescript
@Injectable()
export class CustomerDomainService {
  async validateUniqueEmail(
    email: string,
    repository: CustomerRepositoryPort,
  ): Promise<void> {
    const existing = await repository.findByEmail(email);
    if (existing) {
      throw new CustomerAlreadyExistsError(email);
    }
  }
}
```

---

## CQRS (Command Query Responsibility Segregation)

### Commands (Write Operations)

Commands change the state of the system and don't return data.

```typescript
// 1. Command DTO
export class CreateCustomerCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    // ...
  ) {}
}

// 2. Command Handler
@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler
  implements ICommandHandler<CreateCustomerCommand>
{
  async execute(command: CreateCustomerCommand): Promise<Customer> {
    // 1. Validate business rules
    // 2. Create domain entity
    // 3. Save to repository
    // 4. Publish domain events
  }
}
```

### Queries (Read Operations)

Queries return data without changing system state.

```typescript
// 1. Query DTO
export class GetCustomerQuery implements IQuery {
  constructor(public readonly id: string) {}
}

// 2. Query Handler
@QueryHandler(GetCustomerQuery)
export class GetCustomerHandler implements IQueryHandler<GetCustomerQuery> {
  async execute(query: GetCustomerQuery): Promise<CustomerDto> {
    // Read-only operations
    return this.repository.findById(query.id);
  }
}
```

### CQRS Benefits

- **Performance**: Optimize reads and writes separately
- **Scalability**: Scale read and write databases independently
- **Complexity Management**: Separate complex write logic from simple reads
- **Security**: Different authorization for reads vs writes

---

## Event-Driven Architecture

### Domain Events Lifecycle

```
1. Business Logic Execution
         ↓
2. Domain Event Raised
         ↓
3. Event Persisted with Aggregate
         ↓
4. Event Published to Event Bus
         ↓
5. Event Handlers Process Event
         ↓
6. Side Effects (Sagas, Workflows)
```

### Event Bus Implementation

```typescript
// 1. Domain Event Interface
export interface DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly occurredOn: Date;
  readonly payload: Record<string, any>;
}

// 2. Event Bus Interface
export interface DomainEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}

// 3. NestJS Implementation
@Injectable()
export class NestDomainEventBus implements DomainEventBus {
  constructor(private readonly eventBus: EventBus) {}

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.eventBus.publish(event)));
  }
}
```

### Sagas (Process Managers)

Sagas coordinate long-running business processes by listening to domain events.

```typescript
@Injectable()
export class CustomerSaga {
  @Saga()
  handleCustomerCreated = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(CustomerCreatedEvent),
      map((event) => new SendWelcomeEmailCommand(event.email)),
    );
}
```

---

## Hexagonal Architecture

### Ports (Interfaces)

Ports define contracts that the domain needs from the outside world.

```typescript
// Port (Interface in Domain Layer)
export interface CustomerRepositoryPort {
  save(customer: Customer): Promise<void>;
  findById(id: CustomerId): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
}

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');
```

### Adapters (Implementations)

Adapters implement ports using specific technologies.

```typescript
// Adapter (Implementation in Infrastructure Layer)
@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(customer: Customer): Promise<void> {
    const data = {
      id: customer.getId().getValue(),
      email: customer.getEmail().getValue(),
      // ... map domain object to persistence model
    };

    await this.prisma.customer.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }
}
```

### Dependency Injection

Wire ports to adapters using NestJS DI:

```typescript
@Module({
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository, // Can be swapped for testing
    },
  ],
})
export class CustomerModule {}
```

---

## Temporal.io Integration

### Workflows

Workflows are long-running, durable business processes.

```typescript
// Workflow Definition
export async function userOnboardingWorkflow(
  input: CreateUserWithAddressInput,
): Promise<CreateUserWithAddressResult> {
  // Step 1: Create User
  const userId = await createUserActivity(input.userData);

  // Step 2: Create Address
  const addressId = await createAddressActivity(input.addressData);

  // Step 3: Create Customer
  const customerId = await createCustomerActivity({
    userId,
    addressId,
    ...input.customerData,
  });

  return { userId, addressId, customerId };
}
```

### Activities

Activities are individual units of work within workflows.

```typescript
// Activity Implementation
export async function createUserActivity(
  userData: CreateUserData,
): Promise<string> {
  const commandBus = Container.get(CommandBus);
  const user = await commandBus.execute(
    new CreateUserCommand(userData.name, userData.email),
  );
  return user.getId().getValue();
}
```

### Workflow Triggers

Sagas listen to domain events and trigger workflows:

```typescript
@Injectable()
export class OnboardingSaga {
  @Saga()
  handleStartUserOnboarding = (events$: Observable<any>): Observable<any> =>
    events$.pipe(
      ofType(StartUserOnboardingEvent),
      mergeMap(async (event) => {
        // Trigger Temporal workflow
        await this.temporalService.startWorkflow(
          'userOnboardingWorkflow',
          event.data,
        );
      }),
    );
}
```

---

## Implementation Patterns

### 1. Creating a New Command Handler

```typescript
// Step 1: Create Command
export class CreateProductCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly price: number,
  ) {}
}

// Step 2: Create Handler
@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(DOMAIN_EVENT_BUS)
    private readonly domainEventBus: DomainEventBus,
  ) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    // 1. Validate business rules
    const existingProduct = await this.productRepository.findByName(
      command.name,
    );
    if (existingProduct) {
      throw new ProductAlreadyExistsError(command.name);
    }

    // 2. Create domain entity (with events)
    const product = Product.create(command.name, command.price);

    // 3. Persist
    await this.productRepository.save(product);

    // 4. Publish events
    await this.domainEventBus.publishAll(product.pullDomainEvents());

    return product;
  }
}
```

### 2. Creating a New Aggregate Root

```typescript
export class Product extends AggregateRoot {
  constructor(
    private readonly id: ProductId,
    private name: string,
    private price: Money,
    private readonly createdAt: Date = new Date(),
  ) {
    super();
  }

  static create(name: string, price: number): Product {
    // Validate business rules
    if (price <= 0) {
      throw new InvalidPriceError(price);
    }

    const product = new Product(new ProductId(), name, new Money(price));

    // Raise domain event
    product.apply(
      new ProductCreatedEvent(product.getId().getValue(), name, price),
    );

    return product;
  }

  updatePrice(newPrice: number): void {
    if (newPrice <= 0) {
      throw new InvalidPriceError(newPrice);
    }

    this.price = new Money(newPrice);
    this.apply(new ProductPriceUpdatedEvent(this.id.getValue(), newPrice));
  }
}
```

### 3. Creating a New Repository Port

```typescript
// Port Interface
export interface ProductRepositoryPort {
  save(product: Product): Promise<void>;
  findById(id: ProductId): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  delete(id: ProductId): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
```

### 4. Creating a Repository Adapter

```typescript
@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: Product): Promise<void> {
    const data = {
      id: product.getId().getValue(),
      name: product.getName(),
      price: product.getPrice().getValue(),
      createdAt: product.getCreatedAt(),
    };

    await this.prisma.product.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async findById(id: ProductId): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id: id.getValue() },
    });

    if (!product) return null;

    return Product.fromPersistence(
      product.id,
      product.name,
      product.price,
      product.createdAt,
    );
  }
}
```

---

## Development Guidelines

### 📁 File Naming Conventions

```
Commands:     create-user.command.ts
Handlers:     create-user.handler.ts
Queries:      get-user.query.ts
Entities:     user.entity.ts
Value Objects: user-id.vo.ts
Events:       user-created.event.ts
Exceptions:   user-not-found.error.ts
Ports:        user.repository.port.ts
Adapters:     prisma-user.repository.ts
```

### 🧪 Testing Strategy

#### Unit Tests

```typescript
describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let mockRepository: jest.Mocked<UserRepositoryPort>;
  let mockEventBus: jest.Mocked<DomainEventBus>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    mockEventBus = createMockEventBus();
    handler = new CreateUserHandler(mockRepository, mockEventBus);
  });

  it('should create user when email is unique', async () => {
    // Arrange
    mockRepository.findByEmail.mockResolvedValue(null);
    const command = new CreateUserCommand('John', 'john@example.com');

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result).toBeInstanceOf(User);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockEventBus.publishAll).toHaveBeenCalled();
  });
});
```

#### Integration Tests

```typescript
describe('User Module Integration', () => {
  let app: INestApplication;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [UserModule, TestDatabaseModule],
    }).compile();

    app = module.createNestApplication();
    commandBus = module.get(CommandBus);
    await app.init();
  });

  it('should create user end-to-end', async () => {
    const command = new CreateUserCommand('John', 'john@example.com');
    const user = await commandBus.execute(command);

    expect(user.getEmail().getValue()).toBe('john@example.com');
  });
});
```

### 🔄 Migration Guidelines

#### Adding New Features

1. **Start with Domain**: Define entities, value objects, events
2. **Add Application Layer**: Commands, queries, handlers
3. **Implement Infrastructure**: Repository adapters
4. **Wire Dependencies**: Module configuration
5. **Add Presentation**: Controllers, DTOs

#### Modifying Existing Features

1. **Check Domain Rules**: Ensure changes don't break invariants
2. **Update Events**: Add new events if state changes
3. **Migrate Data**: Plan database schema changes
4. **Update Tests**: Maintain test coverage

---

## Examples

### 🎯 Complete Feature Example: Order Management

Let's implement a complete Order management feature:

#### 1. Domain Layer

```typescript
// order.entity.ts
export class Order extends AggregateRoot {
  constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private readonly createdAt: Date = new Date(),
  ) {
    super();
  }

  static create(customerId: string, items: OrderItemData[]): Order {
    if (items.length === 0) {
      throw new EmptyOrderError();
    }

    const order = new Order(
      new OrderId(),
      new CustomerId(customerId),
      items.map((item) => new OrderItem(item.productId, item.quantity)),
      OrderStatus.PENDING,
    );

    order.apply(
      new OrderCreatedEvent(order.getId().getValue(), customerId, items),
    );

    return order;
  }

  confirm(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new InvalidOrderStatusError(this.status, OrderStatus.CONFIRMED);
    }

    this.status = OrderStatus.CONFIRMED;
    this.apply(new OrderConfirmedEvent(this.id.getValue()));
  }
}

// order-status.vo.ts
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
```

#### 2. Application Layer

```typescript
// create-order.command.ts
export class CreateOrderCommand implements ICommand {
  constructor(
    public readonly customerId: string,
    public readonly items: { productId: string; quantity: number }[],
  ) {}
}

// create-order.handler.ts
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepositoryPort,
    @Inject(DOMAIN_EVENT_BUS)
    private readonly domainEventBus: DomainEventBus,
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const order = Order.create(command.customerId, command.items);
    await this.orderRepository.save(order);
    await this.domainEventBus.publishAll(order.pullDomainEvents());
    return order;
  }
}
```

#### 3. Infrastructure Layer

```typescript
// prisma-order.repository.ts
@Injectable()
export class PrismaOrderRepository implements OrderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: Order): Promise<void> {
    await this.prisma.order.upsert({
      where: { id: order.getId().getValue() },
      update: {
        status: order.getStatus(),
        // ... other fields
      },
      create: {
        id: order.getId().getValue(),
        customerId: order.getCustomerId().getValue(),
        status: order.getStatus(),
        createdAt: order.getCreatedAt(),
        items: {
          create: order.getItems().map((item) => ({
            productId: item.getProductId(),
            quantity: item.getQuantity(),
          })),
        },
      },
    });
  }
}
```

#### 4. Presentation Layer

```typescript
// order.controller.ts
@Controller('orders')
export class OrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    const command = new CreateOrderCommand(dto.customerId, dto.items);
    const order = await this.commandBus.execute(command);

    return {
      id: order.getId().getValue(),
      status: order.getStatus(),
      createdAt: order.getCreatedAt(),
    };
  }
}
```

### 🌊 Workflow Example: Order Fulfillment

```typescript
// order-fulfillment.workflow.ts
export async function orderFulfillmentWorkflow(orderId: string): Promise<void> {
  // Step 1: Reserve inventory
  await reserveInventoryActivity(orderId);

  // Step 2: Process payment
  await processPaymentActivity(orderId);

  // Step 3: Ship order
  await shipOrderActivity(orderId);

  // Step 4: Send confirmation
  await sendShippingConfirmationActivity(orderId);
}

// order.saga.ts
@Injectable()
export class OrderSaga {
  @Saga()
  handleOrderCreated = (events$: Observable<any>): Observable<any> =>
    events$.pipe(
      ofType(OrderCreatedEvent),
      mergeMap(async (event) => {
        await this.temporalService.startWorkflow(
          'orderFulfillmentWorkflow',
          event.aggregateId,
        );
      }),
    );
}
```

---

## Best Practices

### ✅ DO

1. **Keep Domain Pure**: No infrastructure dependencies in domain layer
2. **Use Value Objects**: For primitive obsession prevention
3. **Raise Domain Events**: For important business occurrences
4. **Validate in Domain**: Business rules belong in entities
5. **Use Ports**: Abstract external dependencies
6. **Single Responsibility**: One handler per command/query
7. **Immutable Events**: Never modify domain events after creation
8. **Async Event Handling**: Don't block command execution for events

### ❌ DON'T

1. **Don't Mix Concerns**: Keep read/write operations separate
2. **Don't Skip Validation**: Always validate business rules
3. **Don't Use Generic Errors**: Create specific domain exceptions
4. **Don't Forget Events**: Publish events after state changes
5. **Don't Expose Internals**: Use getters, not public fields
6. **Don't Couple Contexts**: Avoid direct dependencies between contexts
7. **Don't Ignore Failures**: Handle workflow failures gracefully

### 🔧 Performance Tips

1. **Batch Event Publishing**: Use `publishAll()` instead of multiple `publish()`
2. **Optimize Queries**: Use read-optimized projections
3. **Cache Read Models**: Cache frequently accessed data
4. **Async Processing**: Use background workers for heavy operations
5. **Connection Pooling**: Configure database connections properly

### 🛡️ Security Considerations

1. **Input Validation**: Validate at boundaries (controllers)
2. **Authorization**: Check permissions in application layer
3. **Audit Events**: Log important business events
4. **Encryption**: Encrypt sensitive data in value objects
5. **Rate Limiting**: Protect endpoints from abuse

---

## Troubleshooting

### Common Issues

#### 1. Circular Dependencies

**Problem**: Module A imports Module B, which imports Module A

**Solution**: Use `forwardRef()` or extract common interfaces

```typescript
@Module({
  imports: [forwardRef(() => CustomerModule)],
})
export class UserModule {}
```

#### 2. Domain Events Not Publishing

**Problem**: Events are raised but not published

**Checklist**:

- ✅ Is `DOMAIN_EVENT_BUS` injected in handler?
- ✅ Is `publishAll()` called after `save()`?
- ✅ Is `IntegrationModule` imported?
- ✅ Are events properly raised in entity?

#### 3. Repository Injection Fails

**Problem**: `Cannot resolve dependency CUSTOMER_REPOSITORY`

**Solution**: Ensure repository is provided in module

```typescript
@Module({
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
  ],
})
export class CustomerModule {}
```

#### 4. Temporal Workflow Errors

**Problem**: Workflows fail to start or complete

**Debugging Steps**:

1. Check Temporal server is running: `http://localhost:8233`
2. Verify workflow registration in `temporal.service.ts`
3. Check activity implementations
4. Review workflow history in Temporal UI

#### 5. Database Schema Mismatches

**Problem**: Entity doesn't match database schema

**Solution**:

1. Update Prisma schema
2. Generate migration: `npx prisma migrate dev`
3. Update repository mapping logic

### Debugging Tools

#### 1. Event Tracing

```typescript
// Add logging to event bus
@Injectable()
export class LoggingDomainEventBus implements DomainEventBus {
  constructor(
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {}

  async publishAll(events: DomainEvent[]): Promise<void> {
    this.logger.log(`Publishing ${events.length} events`, events);
    await Promise.all(events.map((event) => this.eventBus.publish(event)));
  }
}
```

#### 2. Command/Query Logging

```typescript
// Add interceptor for command tracing
@Injectable()
export class CommandLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const command = context.getArgs()[0];
    console.log('Executing command:', command.constructor.name);
    return next.handle();
  }
}
```

### Development Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma generate
npx prisma db push

# 3. Start Temporal server
npx @temporalio/cli server start-dev

# 4. Start application
npm run start:dev

# 5. View Temporal UI
open http://localhost:8233

# 6. View database
npx prisma studio
```

---

## Conclusion

This architecture provides a solid foundation for building complex, maintainable applications. Key benefits:

- 🏗️ **Separation of Concerns**: Each layer has a single responsibility
- 🧪 **Testability**: Easy to unit test business logic
- 🔄 **Event-Driven**: Loose coupling between components
- 🌊 **Durable Processes**: Long-running workflows that survive failures
- 📈 **Scalability**: Independent scaling of different concerns
- 🛡️ **Maintainability**: Clear boundaries and contracts

Remember: Start simple and evolve. Not every feature needs the full complexity - use patterns where they add value!

---

## Additional Resources

- [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Temporal.io Documentation](https://docs.temporal.io/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

---

**Happy Coding! 🚀**
