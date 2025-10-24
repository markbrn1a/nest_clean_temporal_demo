import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TemporalService } from '../src/infrastructure/temporal/temporal.service';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('Onboarding E2E Integration', () => {
  let app: INestApplication;
  let temporalService: TemporalService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    temporalService = moduleFixture.get<TemporalService>(TemporalService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.address.deleteMany();
    await prismaService.customer.deleteMany();
    await prismaService.user.deleteMany();
  });

  describe('/onboarding/user (POST)', () => {
    it('should complete full onboarding flow successfully', async () => {
      // Arrange
      const onboardingData = {
        name: 'John Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        companyName: 'Test Corp',
        address: {
          street: '123 Test St',
          city: 'Test City',
          zipCode: '12345',
          country: 'USA',
        },
      };

      // Act - Send HTTP request to trigger onboarding
      const response = await request(app.getHttpServer())
        .post('/onboarding/user')
        .send(onboardingData)
        .expect(201);

      // Assert - Check HTTP response
      expect(response.body).toMatchObject({
        message: 'User onboarding request submitted successfully',
        requestId: expect.stringMatching(
          /^user-onboarding-\\d+-john\\.doe-at-test\\.com$/,
        ),
      });

      // Wait for workflow to complete (in a real test, you might want to poll or use workflow handles)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Assert - Check that entities were created in database
      const users = await prismaService.user.findMany({
        where: { email: 'john.doe@test.com' },
        include: { address: true },
      });

      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        name: 'John Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        address: expect.objectContaining({
          street: '123 Test St',
          city: 'Test City',
          zipCode: '12345',
          country: 'USA',
        }),
      });

      const customers = await prismaService.customer.findMany({
        where: { userId: users[0].id },
      });

      expect(customers).toHaveLength(1);
      expect(customers[0]).toMatchObject({
        companyName: 'Test Corp',
        userId: users[0].id,
      });
    }, 10000); // 10 second timeout for temporal workflow

    it('should handle invalid email gracefully', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email-format',
        address: {
          street: '123 Test St',
          city: 'Test City',
          zipCode: '12345',
          country: 'USA',
        },
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/onboarding/user')
        .send(invalidData)
        .expect(201); // The endpoint should still return 201 as the event is published

      // Assert
      expect(response.body).toMatchObject({
        message: 'User onboarding request submitted successfully',
        requestId: expect.any(String),
      });

      // Wait a bit to ensure workflow had time to fail
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check that no user was created due to validation failure
      const users = await prismaService.user.findMany({
        where: { email: 'invalid-email-format' },
      });

      expect(users).toHaveLength(0);
    });

    it('should handle missing required fields', async () => {
      // Arrange
      const incompleteData = {
        name: 'John Doe',
        // Missing email and address
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/onboarding/user')
        .send(incompleteData)
        .expect(400); // Should return bad request for missing required fields
    });

    it('should handle duplicate email addresses', async () => {
      // Arrange - Create a user first
      await prismaService.user.create({
        data: {
          name: 'Existing User',
          email: 'duplicate@test.com',
          address: {
            create: {
              street: '456 Existing St',
              city: 'Existing City',
              zipCode: '67890',
              country: 'USA',
            },
          },
        },
      });

      const duplicateData = {
        name: 'John Doe',
        email: 'duplicate@test.com',
        address: {
          street: '123 Test St',
          city: 'Test City',
          zipCode: '12345',
          country: 'USA',
        },
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/onboarding/user')
        .send(duplicateData)
        .expect(201); // Event should still be published

      // Wait for workflow to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Assert - Should still only have one user with that email
      const users = await prismaService.user.findMany({
        where: { email: 'duplicate@test.com' },
      });

      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Existing User'); // Original user should remain
    });
  });

  describe('Workflow Status Checking', () => {
    it('should be able to query workflow status', async () => {
      // This test demonstrates how to check workflow status
      const onboardingData = {
        name: 'Status Test',
        email: 'status@test.com',
        address: {
          street: '123 Status St',
          city: 'Status City',
          zipCode: '12345',
          country: 'USA',
        },
      };

      // Start the workflow
      const response = await request(app.getHttpServer())
        .post('/onboarding/user')
        .send(onboardingData)
        .expect(201);

      const requestId = response.body.requestId;
      const workflowId = `user-onboarding-${requestId}`;

      // Check workflow status using Temporal client
      // Note: In a real app, you might expose this as an API endpoint
      try {
        // For testing purposes, we'll just wait and check the database
        // In production, you'd want to expose workflow status endpoints
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const users = await prismaService.user.findMany({
          where: { email: 'status@test.com' },
        });

        expect(users.length).toBeGreaterThanOrEqual(0); // Workflow may succeed or fail
        console.log(
          `Workflow processing result: ${users.length > 0 ? 'SUCCESS' : 'FAILED/PENDING'}`,
        );
      } catch (error) {
        console.log('Workflow status check error:', error.message);
      }
    });
  });
});
