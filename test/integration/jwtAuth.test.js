/* eslint-disable no-unused-expressions */
import '@babel/polyfill';
import 'dotenv/config';
import chai from 'chai';
import chaiHttp from 'chai-http';
import tokenAuth from '../../middlewares/tokenAuth';

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

  describe('POST /bus', () => {
    it('should be a function', () => {
      expect(tokenAuth).to.be.a('function');
    });

    it('should return status code 403 if token is invalid', (done) => {
      chai
        .request(server)
        .post('/api/v1/bus')
        .set('token', 'ghiehtislfjjfi3546785')
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
