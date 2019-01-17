process.env.NODE_ENV = 'test';
const app = require('../app');
const request = require('supertest')(app);
const { expect } = require('chai');
const connection = require('../db/connection');

describe('/api', () => {
  beforeEach(() => {
    return connection.migrate
      .rollback()
      .then(() => connection.migrate.latest())
      .then(() => connection.seed.run());
  });
  after(() => connection.destroy());
  it('GET status: 200 returns an array of endpoinds objects', () => {
    return request
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).to.be.an('array');
        expect(body.endpoints).to.have.length(14);
      });
  });
  it('PATCH status: 405 handles invalid requests', () => {
    return request.patch('/api').expect(405);
  });
  it('DELETE status: 405 handles invalid requests', () => {
    return request.delete('/api').expect(405);
  });
  it('PUT status: 405 handles invalid requests', () => {
    return request.put('/api').expect(405);
  });
  describe('/topics', () => {
    it('GET status: 200 responds with an array of topic objects', () => {
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
    it('POST status: 201 adds successully a topic', () => {
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
    it('POST status: 400 client uses a malformed body(properties missing)', () => {
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
          //console.log(body);
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
    it('GET status: 200 responds with the total of the comments for the specific article', () => {
      return request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(
            body.articles.find(article => article.article_id == 9).comment_count
          ).to.equal('2');
          expect(
            body.articles.find(article => article.article_id == 1).comment_count
          ).to.equal('13');
        });
    });
    it('GET status: 404 client uses a non-existent topic', () => {
      return request
        .get('/api/topics/dogs/articles')
        .expect(404)
        .then(({ body }) => {
          //console.log(body);
          expect(body.message).to.equal('No articles found');
        });
    });
    it('GET status: 200 accepts limit query with default 10', () => {
      return request
        .get('/api/topics/mitch/articles?limit=5')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(5);
        });
    });
    it('GET status: 200 checks if limit defaults to 10 if not given', () => {
      return request
        .get('/api/topics/mitch/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(10);
        });
    });
    it('GET status: 400 client uses string instead of number in limit query', () => {
      return request.get('/api/topics/mitch/articles?limit=gsjfji').expect(400);
    });
    it('GET status: 200 defaults sort_by date', () => {
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
    it('GET status: 200 accepts sort_by and returns an array of objects sorted by author', () => {
      return request
        .get('/api/topics/mitch/articles?sort_by=author&order=desc')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles[0].author).to.equal('rogersop');
          expect(body.articles[9].author).to.equal('butter_bridge');
        });
    });
    it('GET status: 400 client uses invalid column to sort', () => {
      return request
        .get('/api/topics/mitch/articles?sort_by=publish_date&order=desc')
        .expect(400);
    });
    it('GET status: 200 accepts offset query with default 1', () => {
      return request
        .get('/api/topics/mitch/articles?p=2')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles[0].title).to.equal('Moustache');
        });
    });
    it('GET status: 400 client uses string instead of number on p query', () => {
      return request.get('/api/topics/mitch/articles?p=hgdhdnl').expect(400);
    });
    it('POST status: 201 adds successully an article by topic', () => {
      return request
        .post('/api/topics/cats/articles')
        .send({
          title: 'cat types',
          body: "I don't know any",
          username: 'butter_bridge'
        })
        .expect(201)
        .then(({ body }) => {
          //console.log(body.article);
          expect(body.article).to.be.an('object');
          expect(body.article).to.have.keys(
            'article_id',
            'title',
            'body',
            'username',
            'created_at',
            'votes',
            'topic'
          );
          expect(body.article.title).to.equal('cat types');
          expect(body.article.body).to.equal("I don't know any");
          expect(body.article.username).to.equal('butter_bridge');
          expect(body.article.article_id).to.equal(13);
          expect(body.article.created_at).to.equal('2019-01-17T00:00:00.000Z');
        });
    });
    it('POST status: 400 client uses non-existent username', () => {
      return request
        .post('/api/topics/cats/articles')
        .send({
          title: 'beans',
          body: 'They suppose to be good for you!',
          username: 'butter_bean'
        })
        .expect(400);
    });
    it('POST status: 400 client uses non-existent topic', () => {
      return request
        .post('/api/topics/foods/articles')
        .send({
          title: 'veggies',
          body: 'They suppose to be good for you!',
          username: 'butter_bridge'
        })
        .expect(400);
    });
    it('POST status: 400 client using an entry that already exists (except username)', () => {
      return request.post('/api/topics/mitch/articles').send({
        title: 'Moustache',
        body: "Nonsense, it's not even that big!",
        username: 'butter_bridge'
      });
    });
    it('PATCH status: 405 handles invalid requests', () => {
      return request.patch('/api/topics').expect(405);
    });
    it('DELETE status: 405 handles invalid requests', () => {
      return request.delete('/api/topics').expect(405);
    });
    it('PUT status: 405 handles invalid requests', () => {
      return request.put('/api/topics').expect(405);
    });
  });
  describe('/articles', () => {
    it('GET status: 200 responds with an array of article objects', () => {
      return request
        .get('/api/articles')
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
            'topic',
            'body'
          );
        });
    });
    it('GET status: 200 responds with the total of the comments for each article', () => {
      return request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles[0].author).to.equal('butter_bridge');
          expect(body.articles[0].comment_count).to.equal('13');
        });
    });
    it('GET status: 200 accepts a limit query with default 10', () => {
      return request
        .get('/api/articles?limit=5')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(5);
        });
    });
    it('GET status: 200 checks if limit defaults to 10 if not given', () => {
      return request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(10);
        });
    });
    it('GET status: 200 defaults sort_by date', () => {
      return request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles[0].article_id).to.equal(1);
          expect(body.articles[9].article_id).to.equal(10);
        });
    });
    it('GET status: 200 accepts sort_by and returns an array of objects sorted by authors', () => {
      return request
        .get('/api/articles?sort_by=author&order=asc')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles[0].author).to.equal('butter_bridge');
          expect(body.articles[9].author).to.equal('rogersop');
        });
    });
    it('GET status: 400 client uses invalid column to sort', () => {
      return request.get('/api/articles?sort_by=author_name').expect(400);
    });
    it('GET status: 200 accepts offset query with default 1', () => {
      return request
        .get('/api/articles?p=2')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.articles);
          expect(body.articles[0].author).to.equal('icellusedkars');
        });
    });
    it('GET status: 200 returns article by article_id', () => {
      return request
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          //console.log(body);
          expect(body.articles).to.be.an('array');
          expect(body.articles[0]).to.have.keys(
            'author',
            'title',
            'article_id',
            'votes',
            'created_at',
            'topic',
            'body',
            'comment_count'
          );
        });
    });
    it('GET status:400 client uses invalid article_id', () => {
      return request.get('/api/articles/hffjk').expect(400);
    });
    it('GET status: 404 client uses non-existent article_id', () => {
      return request
        .get('/api/articles/89')
        .expect(404)
        .then(({ body }) => {
          expect(body.message).to.equal('No articles found');
        });
    });
    it('PATCH status: 200 responds with updated article', () => {
      return request
        .patch('/api/articles/1')
        .send({ title: 'here is some testing' })
        .expect(200)
        .then(({ body }) => {
          expect(body.article[0].title).to.equal('here is some testing');
          expect(body.article[0].article_id).to.equal(1);
        });
    });
    it('PATCH status: 200 updates multiple columns and responds with updated article', () => {
      return request
        .patch('/api/articles/1')
        .send({ body: 'nat', title: 'this is a test' })
        .expect(200)
        .then(({ body }) => {
          expect(body.article[0].body).to.equal('nat');
          expect(body.article[0].title).to.equal('this is a test');
        });
    });
    it('PATCH status: 200 updates votes', () => {
      return request
        .patch('/api/articles/2')
        .send({ inc_votes: 5 })
        .expect(200)
        .then(({ body }) => {
          // expect(body.article[0].votes).to.equal(5);
          // expect(body.article[0].article_id).to.equal(2);
          //the below test verifies that the right row was updated and the votes column got the expected val
          expect(body.article.find(art => art.article_id === 2).votes).to.equal(
            5
          );
        });
    });
    it('PATCH status: 404 client uses non-existent article_id', () => {
      return request
        .patch('/api/articles/98790')
        .send({ body: 'keep testing' })
        .expect(404)
        .then(({ body }) => {
          expect(body.message).to.equal('No articles found');
        });
    });
    it('DELETE status: 204 deletes article by article_id', () => {
      return request
        .delete('/api/articles/12')
        .expect(204)
        .then(({ body }) => {
          expect(body).to.eql({});
          return connection('articles').where('article_id', 12);
        })
        .then(([article]) => {
          expect(article).to.equal(undefined);
        });
    });
    it('GET status: 404 client uses a non-existent article_id', () => {
      return request
        .get('/api/articles/567/comments')
        .expect(404)
        .then(({ body }) => {
          expect(body.message).to.equal('No articles found');
        });
    });
    it('GET status: 400 client uses wrong type of article_id(only numbers are allowed)', () => {
      return request.get('/api/articles/hjfufj/comments').expect(400);
    });
    it('GET status: 200 responds with comments by article_id', () => {
      return request
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          //console.log(body);
          expect(body.comments).to.be.an('array');
          expect(body.comments[0]).to.have.keys(
            'comment_id',
            'article_id',
            'votes',
            'created_at',
            'author',
            'body'
          );
        });
    });
    it('GET status: 200 accepts limit query with default of 10', () => {
      return request
        .get('/api/articles/1/comments?limit=5')
        .expect(200)
        .then(({ body }) => {
          //console.log(body);
          expect(body.comments).to.have.length(5);
        });
    });
    it('GET status: 200 checks if limit defaults to 10 if not given', () => {
      return request
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).to.have.length(10);
        });
    });
    it('GET status: 400 client uses string instead of number in limit query', () => {
      return request.get('/api/articles/1/comments?limit=gsjfji').expect(400);
    });
    it('GET status: 200 defaults sort_by date', () => {
      return request
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          //console.log(body);
          expect(body.comments[0].author).to.equal('butter_bridge');
          expect(body.comments[9].author).to.equal('icellusedkars');
        });
    });
    it('GET status: 200 accepts sort_by an returns an array of objects sorted by body desc', () => {
      return request
        .get('/api/articles/1/comments?sort_by=comment_id&order=false')
        .expect(200)
        .then(({ body }) => {
          const sortedIds = body.comments
            .map(comment => comment.comment_id)
            .sort((x, y) => y - x);
          expect(body.comments[0].comment_id).to.equal(sortedIds[0]);
          expect(body.comments[9].comment_id).to.equal(sortedIds[9]);
        });
    });
    it('GET status: 400 client uses invalid column to sort', () => {
      return request
        .get('/api/articles/1/comments?sort_by=date&order=desc')
        .expect(400);
    });
    it('GET status: 200 accepts order query true', () => {
      return request
        .get('/api/articles/1/comments?order=true')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments[0].author).to.equal('butter_bridge');
          expect(body.comments[9].author).to.equal('icellusedkars');
        });
    });
    it('GET status: 200 checks order defaults to desc', () => {
      return request
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments[0].body).to.equal(
            'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.'
          );
          expect(body.comments[9].body).to.equal('Ambidextrous marsupial');
        });
    });
    it('GET status: 200 accepts offset query with default 1', () => {
      return request
        .get('/api/articles/1/comments?p=2')
        .expect(200)
        .then(({ body }) => {
          expect(body.comments[0].author).to.equal('icellusedkars');
        });
    });
    it('GET status: 400 client uses string instead of number on p query', () => {
      return request.get('/api/articles/1/comments?p=hgdhdnl').expect(400);
    });
    it('POST status: 201 adds successfully a comment by article_id', () => {
      return request
        .post('/api/articles/1/comments')
        .send({
          username: 'butter_bridge',
          body: 'test test test'
        })
        .expect(201)
        .then(({ body }) => {
          //console.log(body);
          expect(body.comment).to.be.an('object');
          expect(body.comment).to.have.keys(
            'username',
            'body',
            'article_id',
            'votes',
            'comment_id',
            'created_at'
          );
          expect(body.comment.username).to.equal('butter_bridge');
          expect(body.comment.body).to.equal('test test test');
        });
    });
    it('POST status: 400 client uses non-existent article_id', () => {
      return request
        .post('/api/articles/18976/comments')
        .send({ username: 'butter_bridge', body: 'unlimited tests' })
        .expect(400);
    });
    it('PATCH status: 200 responds with the updated comment', () => {
      return request
        .patch('/api/articles/1/comments/2')
        .send({ username: 'icellusedkars' })
        .expect(200)
        .then(({ body }) => {
          expect(body.comment[0].username).to.equal('icellusedkars');
        });
    });
    it('PATCH status: 200 updates multiple columns and responds with updated comment', () => {
      return request
        .patch('/api/articles/1/comments/2')
        .send({ username: 'icellusedkars', body: 'testing' })
        .expect(200)
        .then(({ body }) => {
          expect(body.comment[0].username).to.equal('icellusedkars');
          expect(body.comment[0].body).to.equal('testing');
        });
    });
    it('PATCH status: 200 updates votes', () => {
      return request
        .patch('/api/articles/1/comments/2')
        .send({ inc_votes: 5 })
        .expect(200)
        .then(({ body }) => {
          expect(body.comment.find(com => com.comment_id === 2).votes).to.equal(
            19
          );
        });
    });
    it('PATCH status: 404 uses non-existent comment_id', () => {
      return request
        .patch('/api/articles/1/comments/756586960')
        .send({ inc_votes: 10 })
        .expect(404)
        .then(({ body }) => {
          expect(body.message).to.equal('No comment found');
        });
    });
    it('DELETE status: 204 deletes comment by comment_id', () => {
      return request
        .delete('/api/articles/1/comments/3')
        .expect(204)
        .then(({ body }) => {
          expect(body).to.eql({});
          return connection('comments').where('comment_id', 3);
        })
        .then(([comment]) => expect(comment).to.equal(undefined));
    });
    it('PUT status: 405 handles invalid requests', () => {
      return request.put('/api/articles').expect(405);
    });
  });
  describe('/users', () => {
    it('GET status: 200 responds with an array of user objects', () => {
      return request
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
          //console.log(body.users);
          expect(body.users).to.be.an('array');
          //   expect(body.users[0]).to.have.keys('username', 'avatar_url', 'name');
          //   expect(body.users[0].username).to.equal('butter_bridge');
          //   expect(body.users[2].name).to.equal('paul');
        });
    });
    it('GET status: 200 return user by username', () => {
      return request
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({ body }) => {
          //console.log(users);
          expect(body.users).to.be.an('array');
          expect(body.users[0]).to.have.keys('username', 'avatar_url', 'name');
        });
    });
    it('GET status: 404 client uses non-existent username', () => {
      return request
        .get('/api/users/fiqsf')
        .expect(404)
        .then(({ body }) => {
          expect(body.message).to.equal('Username not found');
        });
    });
    it('PUT status: 405 handles invalid requests', () => {
      return request.put('/api/users').expect(405);
    });
    it('DELETE status: 405 handles invalid requests', () => {
      return request.delete('/api/users').expect(405);
    });
    it('PATCH status: 405 handles invalid requests', () => {
      return request.patch('/api/users').expect(405);
    });
    it('POST status: 405 handles invalid requests', () => {
      return request.post('/api/users').expect(405);
    });
  });
});
