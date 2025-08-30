// src/controllers/facilityController.ts
import { Elysia, t } from 'elysia';
import { FacilityService } from '../services/facilityService';
import { FacilitySchema } from '../types';

export const facilityController = new Elysia({ prefix: '/api/facilities' })
  .decorate('facilityService', new FacilityService())
  .get('/', async ({ facilityService }) => {
    return await facilityService.getAllFacilities();
  }, {
    response: t.Array(FacilitySchema)
  })
  .post('/', async ({ body, facilityService }) => {
    return await facilityService.createFacility(body);
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String())
    }),
    response: FacilitySchema
  });