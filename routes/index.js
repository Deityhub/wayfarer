const user = require('./user.route');
const bus = require('./bus.route');
const trip = require('./trip.route');

module.exports = (app) => {
  app.use('/api/v1', user);
  app.use('/api/v1', bus);
  app.use('/api/v1', trip);
  app.use('/api/v1', (req, res) => {
    // display documentation here
    res.send('Welcome to WayFarer api...');
  });
};
