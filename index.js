/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();
const config = require('config');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: setup cors for this project

// call all my routes here
routes(app);

// eslint-disable-next-line no-unused-vars
app.use('/api/v1', (err, req, res, next) => {
  if (app.get('env') === 'development') console.log(err);

  return res.status(req.status || 500).send({
    status: 'error',
    error: err.message,
  });
});

const port = process.env.PORT || config.get('port');
const server = app.listen(port, () => {
  if (app.get('env') === 'development') console.log(`server running on port ${port}`);
});

module.exports = server;
