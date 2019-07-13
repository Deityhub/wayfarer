/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
require('dotenv').config();
const config = require('config');
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// call all my routes here
routes(app);

// handle all errors
// eslint-disable-next-line no-unused-vars
app.use('/', (err, req, res, next) => {
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
