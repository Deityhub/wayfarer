/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');

const tokenAuth = require('../../middlewares/tokenAuth');

const { expect } = chai;
chai.use(chaiHttp);

let server;

describe('Token Authentication Middleware', () => {
  before(() => {
    // eslint-disable-next-line global-require
    server = require('../../index');
  });

  after(() => {
    server.close();
  });

  describe('POST /api/v1/bus', () => {
    it('should be a function', () => {
      expect(tokenAuth).to.be.a('function');
    });

    it('should return status code 403 if token is invalid', (done) => {
      chai
        .request(server)
        .post('/api/v1/bus')
        .set('Authorization', 'Bearer ghiehtislfjjfi3546785')
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });

    it('should return status error and status code 401', (done) => {
      chai
        .request(server)
        .post('/api/v1/bus')
        .end((err, res) => {
          expect(res.body.status).to.eql('error');
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});
