const user = require('./user.route');

module.exports = (app) => {
  app.use('/api/v1', user);
  app.use('/api/v1', (req, res) => {
    // display documentation here
    res.send('Welcome to WayFarer api...');
  });
};
