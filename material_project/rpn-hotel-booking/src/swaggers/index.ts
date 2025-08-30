// Update src/swagger/index.ts
import { swaggerConfig } from './config';
import { roomSchemas } from './schemas/room';
import { bookingSchemas } from './schemas/booking';
import { facilitySchemas } from './schemas/facility';
import { customerSchemas } from './schemas/customer';
import { roomPaths } from './paths/room';
import { bookingPaths } from './paths/booking';
import { facilityPaths } from './paths/facility';
import { customerPaths } from './paths/customer';

const swagger = {
  ...swaggerConfig,
  components: {
    ...swaggerConfig.components,
    schemas: {
      ...roomSchemas,
      ...bookingSchemas,
      ...facilitySchemas,
      ...customerSchemas
    }
  },
  paths: {
    ...roomPaths,
    ...bookingPaths,
    ...facilityPaths,
    ...customerPaths
  }
};

export default swagger;