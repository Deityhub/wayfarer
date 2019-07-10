const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const user = require('./user.route');
const bus = require('./bus.route');
const trip = require('./trip.route');

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
      url: 'http://wayfarer-test.herokuapp.com',
      description: 'Online hosted server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Locally hosted server',
    },
  ],
  basePath: '/api/v1', // the basepath of your endpoint
};

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition,
  // path to the API docs
  apis: ['./docs/**/*.yaml'],
};
// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api/v1', user);
  app.use('/api/v1', bus);
  app.use('/api/v1', trip);
  app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
