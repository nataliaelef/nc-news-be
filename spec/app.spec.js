process.env.NODE_ENV = 'test';
const app = require('../app');
const request = require('supertest')(app);
const { expect } = require('chai');
const connection = require('../db/connection');

xdescribe('/api', () => {
  after(() => connection.destroy());
  describe('/topics', () => {
    it('GET status:200 responds with an array of topic objects');
    return request
      .get('/api/topics')
      .expect(200)
      .then(res => {
        expect(res.body.topics).to.have.length(2);
      });
  });
});
