import swaggerJsdoc from 'swagger-jsdoc'; // Use default import
import * as swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YaGoo API',
      version: '1.0.0',
      
  description: 'API documentation for YaGoo project',
    },
  },
  apis: ['./src/routes/*.ts'], // Update path if needed
};

const swaggerSpec = swaggerJsdoc(options); // This works now as it's the default function

export { swaggerSpec, swaggerUi };
