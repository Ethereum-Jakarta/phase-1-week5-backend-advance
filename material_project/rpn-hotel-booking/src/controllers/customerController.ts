// src/controllers/customerController.ts
import { Elysia, t } from 'elysia';
import { CustomerService } from '../services/customerService';
import { CustomerSchema, CreateCustomerSchema } from '../types';

export const customerController = new Elysia({ prefix: '/api/customers' })
  .decorate('customerService', new CustomerService())
  .get('/', async ({ customerService }) => {
    return await customerService.getAllCustomers();
  }, {
    response: t.Array(CustomerSchema)
  })
  .get('/:id', async ({ params: { id }, customerService }) => {
    const customer = await customerService.getCustomerById(id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  }, {
    response: CustomerSchema
  })
  .post('/', async ({ body, customerService }) => {
    const existingCustomer = await customerService.getCustomerByEmail(body.email);
    if (existingCustomer) {
      throw new Error('Customer with this email already exists');
    }
    return await customerService.createCustomer(body);
  }, {
    body: CreateCustomerSchema,
    response: CustomerSchema
  });
