import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import user from './user.route';
import bus from './bus.route';
import booking from './booking.route';
import trip from './trip.route';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.1',
  info: {
    title: 'WayFarer REST API Documentation',
    version: '1.0.0',
    description: 'A public bus transportation booking server',
  },
  servers: [
    {
      url: 'https://wayfarer-test.herokuapp.com/api/v1',
      description: 'Online hosted server',
    },
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Locally hosted server',
    },
  ],
  basePath: '/', // the basepath of your endpoint
};

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition,
  // path to the API docs
  apis: ['../docs/**/*.yaml'],
};
// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

const routes = (app) => {
  app.use('/api/v1', user);
  app.use('/api/v1', bus);
  app.use('/api/v1', trip);
  app.use('/api/v1', booking);
  app.use(swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default routes;
