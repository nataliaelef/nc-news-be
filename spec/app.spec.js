process.env.NODE_ENV = 'test';
const app = require('../app');
const request = require('supertest')(app);
const { expect } = require('chai');
const connection = require('../db/connection');

describe('/api', () => {
  beforeEach(() => {
    //console.log('in before each hook...');
    return connection.migrate
      .rollback()
      .then(() => connection.migrate.latest())
      .then(() => connection.seed.run());
  });
  after(() => connection.destroy());
  describe('/topics', () => {
    it('GET status:200 responds with an array of topic objects', () => {
      return request
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.be.an('array');
          expect(body.topics[0]).to.have.keys('description', 'slug');
          expect(body.topics[0].slug).to.equal('mitch');
          expect(body.topics[0].description).to.equal(
            'The man, the Mitch, the legend'
          );
        });
    });
    it('POST status:201 adds successully a topic', () => {
      return request
        .post('/api/topics')
        .send({ slug: 'nat', description: 'developer to be' })
        .expect(201)
        .then(({ body }) => {
          //console.log(body.topic);
          expect(body.topic).to.be.an('object');
          expect(body.topic.slug).to.equal('nat');
          expect(body.topic.description).to.equal('developer to be');
        });
    });
    it('POST status:400 client uses a malformed body(properties missing)', () => {
      return request
        .post('/api/topics')
        .send({ animal: 'dog' })
        .expect(400);
    });
    it('POST status: 400 client uses an entry that exists already(slug must be unique)', () => {
      return request
        .post('/api/topics')
        .send({ slug: 'mitch' })
        .expect(400);
    });
    it('GET status: 200 responds with an array of article objects for a given topic', () => {
      return request
        .get('/api/topics/cats/articles')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles).to.be.an('array');
          expect(body.articles[0]).to.have.keys(
            'author',
            'title',
            'article_id',
            'votes',
            'comment_count',
            'created_at',
            'topic'
          );
        });
    });
    it('GET status:404 client uses a non-existent topic', () => {
      return request
        .get('/api/topics/dogs/articles')
        .expect(404)
        .then(({ body }) => {
          //console.log(body);
          expect(body.message).to.equal('No articles found');
        });
    });
    it('GET status:200 accepts limit query with default 10', () => {
      return request
        .get('/api/topics/mitch/articles?limit=10')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(10);
        });
    });
    it('GET status:200 defaults sort_by date', () => {
      return request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles[0].title).to.equal(
            'Living in the shadow of a great man'
          );
          expect(body.articles[9].title).to.equal('Am I a cat?');
        });
    });
    it('GET status:200 accepts sort_by and returns a list sorted by author', () => {
      return request
        .get('/api/topics/mitch/articles?sort_by=author&order=desc')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles[9].author).to.equal('butter_bridge');
        });
    });
    it('GET status:400 client uses invalid column to sort', () => {
      return request
        .get('/api/topics/mitch/articles?sort_by=publish_date&order=desc')
        .expect(400);
    });
    it('GET status:200 accepts offset query with default 1', () => {
      return request
        .get('/api/topics/mitch/articles?p=2')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles[0].title).to.equal('Moustache');
        });
    });
    //it('GET status:200 sort')
  });
});
