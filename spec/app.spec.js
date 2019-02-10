process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const request = require('supertest')(require('../app'));
const connection = require('../db/connection');

describe('/api', () => {
  beforeEach(() =>
    connection.migrate
      .rollback()
      .then(() => connection.migrate.latest())
      .then(() => connection.seed.run())
  );
  after(() => connection.destroy());
  it('GET status: 200 returns an array of endpoinds objects', () =>
    request
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).to.be.an('array');
        expect(body.endpoints).to.have.length(14);
      }));
  it('PATCH status: 405 handles invalid requests', () =>
    request.patch('/api').expect(405));
  it('DELETE status: 405 handles invalid requests', () =>
    request.delete('/api').expect(405));
  it('PUT status: 405 handles invalid requests', () =>
    request.put('/api').expect(405));
  it('POST status: 405 handles invalid requests', () =>
    request.post('/api').expect(405));
  describe('/topics', () => {
    it('GET status: 200 responds with an array of topic objects', () =>
      request
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.be.an('array');
          expect(body.topics[0]).to.have.keys('description', 'slug');
          expect(body.topics[0].slug).to.equal('mitch');
          expect(body.topics[0].description).to.equal(
            'The man, the Mitch, the legend'
          );
        }));
    it('POST status: 201 adds successully a topic', () =>
      request
        .post('/api/topics')
        .send({ slug: 'nat', description: 'developer to be' })
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).to.be.an('object');
          expect(body.topic.slug).to.equal('nat');
          expect(body.topic.description).to.equal('developer to be');
        }));
    it('POST status: 400 client uses a malformed body(properties missing)', () =>
      request
        .post('/api/topics')
        .send({ description: 'keep testing' })
        .expect(400));
    it('POST status: 400 client uses an entry that exists already (slug must be unique)', () =>
      request
        .post('/api/topics')
        .send({ slug: 'mitch', description: 'testing' })
        .expect(400));
    it('PATCH status: 405 handles invalid requests', () =>
      request.patch('/api/topics').expect(405));
    it('DELETE status: 405 handles invalid requests', () =>
      request.delete('/api/topics').expect(405));
    it('PUT status: 405 handles invalid requests', () =>
      request.put('/api/topics').expect(405));
    describe('/:topic', () => {
      it('DELETE status: 204 deletes topic by slug', () =>
        request
          .delete('/api/topics/cats')
          .expect(204)
          .then(({ body }) => {
            expect(body).to.eql({});
            return connection('topics').where('slug', 'cats');
          })
          .then(([topic]) => {
            expect(topic).to.equal(undefined);
          }));
      it('POST status: 405 handles invalid request', () =>
        request.post('/api/topics/:topic').expect(405));
      it('PATCH status: 405 handles invalid request', () =>
        request.patch('/api/topics/:topic').expect(405));
      it('GET status: 405 handles invalid request', () =>
        request.get('/api/topics/:topic').expect(405));
      it('PUT status: 405 handles invalid request', () =>
        request.put('/api/topics/:topic').expect(405));
    });
    describe('/:topic/articles', () => {
      it('GET status: 200 responds with an array of article objects for a given topic', () =>
        request
          .get('/api/topics/cats/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.an('array');
            expect(body.articles[0]).to.have.keys(
              'author',
              'title',
              'article_id',
              'votes',
              'total_count',
              'created_at',
              'topic',
              'body'
            );
          }));
      it('GET status: 200 responds with the total of the comments for the specific article', () =>
        request
          .get('/api/topics/mitch/articles')
          .expect(200)
          .then(({ body }) => {
            expect(
              body.articles.find(article => article.article_id === 9)
                .total_count
            ).to.equal('2');
            expect(
              body.articles.find(article => article.article_id === 1)
                .total_count
            ).to.equal('13');
          }));
      it('GET status: 404 client uses a non-existent topic', () =>
        request.get('/api/topics/dogs/articles').expect(404));
      it('GET status: 200 accepts limit query with default 10', () =>
        request
          .get('/api/topics/mitch/articles?limit=5')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.have.length(5);
          }));
      it('GET status: 200 checks if limit defaults to 10 if not given', () =>
        request
          .get('/api/topics/mitch/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.have.length(10);
          }));
      it('GET status: 400 client uses string instead of number in limit query', () =>
        request.get('/api/topics/mitch/articles?limit=gsjfji').expect(400));
      it('GET status: 200 defaults sort_by date', () =>
        request
          .get('/api/topics/mitch/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0].title).to.equal(
              'Living in the shadow of a great man'
            );
            expect(body.articles[9].title).to.equal('Am I a cat?');
          }));
      it('GET status: 200 accepts sort_by and returns an array of objects sorted by author', () =>
        request
          .get('/api/topics/mitch/articles?sort_by=author&order=desc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0].author).to.equal('rogersop');
            expect(body.articles[9].author).to.equal('butter_bridge');
          }));
      it('GET status: 400 client uses invalid column to sort', () =>
        request
          .get('/api/topics/mitch/articles?sort_by=publish_date&order=desc')
          .expect(400));
      it('GET status: 200 accepts offset query with default 1', () =>
        request
          .get('/api/topics/mitch/articles?p=2')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles[0].title).to.equal('Moustache');
          }));
      it('POST status: 201 adds successully an article by topic', () =>
        request
          .post('/api/topics/cats/articles')
          .send({
            title: 'cat types',
            body: "I don't know any",
            username: 'butter_bridge'
          })
          .expect(201)
          .then(({ body }) => {
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
          }));
      it('POST status: 404 client uses non-existent username', () =>
        request
          .post('/api/topics/cats/articles')
          .send({
            title: 'beans',
            body: 'They suppose to be good for you!',
            username: 'butter_bean'
          })
          .expect(404));

      it('POST status: 404 client uses non-existent topic', () =>
        request
          .post('/api/topics/foods/articles')
          .send({
            title: 'veggies',
            body: 'They suppose to be good for you!',
            username: 'butter_bridge'
          })
          .expect(404));
      it('POST status: 400 client using an entry that already exists (except username)', () =>
        request.post('/api/topics/mitch/articles').send({
          title: 'Moustache'
        }));
      it('PUT status: 405 handles invalid requests', () =>
        request.put('/api/topics/cats/articles').expect(405));
      it('DELETE status: 405 handles invalid requests', () =>
        request.delete('/api/topics/cats/articles').expect(405));
      it('PATCH status: 405 handles invalid requests', () =>
        request.patch('/api/topics/cats/articles').expect(405));
    });
  });
  describe('/articles', () => {
    it('GET status: 200 responds with an array of article objects', () =>
      request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an('array');
          expect(body.articles[0]).to.have.keys(
            'author',
            'title',
            'article_id',
            'votes',
            'body',
            'total_count',
            'created_at',
            'topic'
          );
        }));
    it('GET status: 200 responds with the total of the comments for each article', () =>
      request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].author).to.equal('butter_bridge');
          expect(body.articles[0].total_count).to.equal('13');
        }));
    it('GET status: 200 accepts a limit query with default 10', () =>
      request
        .get('/api/articles?limit=5')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(5);
        }));
    it('GET status: 200 checks if limit defaults to 10 if not given', () =>
      request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(10);
        }));
    it('GET status: 200 defaults sort_by date', () =>
      request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].article_id).to.equal(1);
          expect(body.articles[9].article_id).to.equal(10);
        }));
    it('GET status: 200 accepts sort_by and returns an array of objects sorted by authors', () =>
      request
        .get('/api/articles?sort_by=author&order=asc')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].author).to.equal('butter_bridge');
          expect(body.articles[9].author).to.equal('rogersop');
        }));
    it('GET status: 400 client uses invalid column to sort', () =>
      request.get('/api/articles?sort_by=author_name').expect(400));
    it('GET status: 200 accepts offset query with default 1', () =>
      request
        .get('/api/articles?p=2')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].author).to.equal('icellusedkars');
        }));
    it('PATCH status: 405 handles invalid requests', () =>
      request.patch('/api/articles').expect(405));
    it('DELETE status: 405 handles invalid requests', () =>
      request.delete('/api/articles').expect(405));
    it('PUT status: 405 handles invalid requests', () =>
      request.put('/api/articles').expect(405));
    it('POST status: 405 handles invalid requests', () =>
      request.post('/api/articles').expect(405));
    describe('/:article_id', () => {
      it('GET status: 200 returns article by article_id', () =>
        request
          .get('/api/articles/1')
          .expect(200)
          .then(({ body }) => {
            expect(body.article).to.have.keys(
              'author',
              'title',
              'article_id',
              'votes',
              'body',
              'created_at',
              'topic',
              'total_count'
            );
          }));
      it('GET status:400 client uses invalid article_id', () =>
        request.get('/api/articles/hffjk').expect(400));
      it('GET status: 404 client uses non-existent article_id', () =>
        request.get('/api/articles/89').expect(404));
      it('PATCH status: 200 updates votes (increasing)', () =>
        request
          .patch('/api/articles/2')
          .send({ inc_votes: 5 })
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(5);
            expect(body.article.article_id).to.equal(2);
          }));
      it('PATCH status: 200 updates votes (decreasing)', () =>
        request
          .patch('/api/articles/3')
          .send({ inc_votes: -5 })
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(-5);
            expect(body.article.article_id).to.equal(3);
          }));
      it('PATCH status: 200 responds with unmodified article inc_votes has not been provided', () =>
        request
          .patch('/api/articles/1')
          .send({ inc_votes: '' })
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(100);
            expect(body.article.article_id).to.equal(1);
          }));
      it('PATCH status: 200 responds with unmodified article inc_votes has not been provided', () =>
        request
          .patch('/api/articles/1')
          .send({})
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(100);
            expect(body.article.article_id).to.equal(1);
          }));
      it('PATCH status: 404 client uses non-existent article_id', () =>
        request
          .patch('/api/articles/98790')
          .send({ body: 'keep testing' })
          .expect(404));
      it('DELETE status: 204 deletes article by article_id', () =>
        request
          .delete('/api/articles/12')
          .expect(204)
          .then(({ body }) => {
            expect(body).to.eql({});
            return connection('articles').where('article_id', 12);
          })
          .then(([article]) => {
            expect(article).to.equal(undefined);
          }));
      it('DELETE status: 204 deletes article with comments', () => {
        request
          .delete('/api/articles/9')
          .expect(204)
          .then(({ body }) => {
            expect(body).to.eql({});
            return connection('articles').where('article_id', 9);
          })
          .then(([article]) => {
            expect(article).to.equal(undefined);
          });
      });
      it('DELETE status: 400 client uses wrong type of article_id (only number)', () =>
        request.delete('/api/articles/fihk').expect(400));
      it('DELETE status: 404 client uses non-existent article_id', () =>
        request.delete('/api/articles/5678').expect(404));
      it('POST status: 405 handles invalid requests', () => {
        request.post('/api/articles/76').expect(405);
      });
      it('PUT status: 405 handles invalid requests', () =>
        request.put('/api/articles/1').expect(405));
      describe('/comments', () => {
        // it('GET status: 404 client uses a non-existent article_id', () =>
        //   request.get('/api/articles/567/comments').expect(404));
        it('GET status: 400 client uses wrong type of article_id (only numbers are allowed)', () =>
          request.get('/api/articles/hjfufj/comments').expect(400));
        it('GET status: 200 responds with comments by article_id', () =>
          request
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body }) => {
              // console.log(body);
              expect(body.comments).to.be.an('array');
              expect(body.comments[0]).to.have.keys(
                'comment_id',
                'article_id',
                'votes',
                'created_at',
                'author',
                'body'
              );
            }));
        it('GET status: 200 accepts limit query with default of 10', () =>
          request
            .get('/api/articles/1/comments?limit=5')
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.have.length(5);
            }));
        it('GET status: 200 checks if limit defaults to 10 if not given', () =>
          request
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.have.length(10);
            }));
        it('GET status: 400 client uses string instead of number in limit query', () =>
          request.get('/api/articles/1/comments?limit=gsjfji').expect(400));
        it('GET status: 200 defaults sort_by date', () =>
          request
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body }) => {
              expect(body.comments[0].author).to.equal('butter_bridge');
              expect(body.comments[9].author).to.equal('icellusedkars');
            }));
        it('GET status: 200 accepts sort_by an returns an array of objects sorted by body desc', () =>
          request
            .get('/api/articles/1/comments?sort_by=comment_id&order=false')
            .expect(200)
            .then(({ body }) => {
              const sortedIds = body.comments
                .map(comment => comment.comment_id)
                .sort((x, y) => y - x);
              expect(body.comments[0].comment_id).to.equal(sortedIds[0]);
              expect(body.comments[9].comment_id).to.equal(sortedIds[9]);
            }));
        it('GET status: 400 client uses invalid column to sort', () =>
          request
            .get('/api/articles/1/comments?sort_by=date&order=desc')
            .expect(400));
        it('GET status: 200 accepts order query true', () =>
          request
            .get('/api/articles/1/comments?order=true&sort_by=votes')
            .expect(200)
            .then(({ body }) => {
              expect(body.comments[0].votes).to.equal(-100);
              expect(body.comments[9].votes).to.equal(0);
            }));
        it('GET status: 200 checks order defaults to desc', () =>
          request
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({ body }) => {
              expect(body.comments[0].body).to.equal(
                'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.'
              );
              expect(body.comments[9].body).to.equal('Ambidextrous marsupial');
            }));
        it('GET status: 200 accepts offset query with default 1', () =>
          request
            .get('/api/articles/1/comments?p=2')
            .expect(200)
            .then(({ body }) => {
              expect(body.comments[0].author).to.equal('icellusedkars');
            }));
        it('GET status: 400 client uses string instead of number on p query', () =>
          request.get('/api/articles/1/comments?p=hgdhdnl').expect(400));
        it('POST status: 201 adds successfully a comment by article_id', () =>
          request
            .post('/api/articles/1/comments')
            .send({
              username: 'butter_bridge',
              body: 'test test test'
            })
            .expect(201)
            .then(({ body }) => {
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
            }));
        it('POST status: 404 client uses non-existent article_id', () =>
          request
            .post('/api/articles/18976/comments')
            .send({ username: 'butter_bridge', body: 'unlimited tests' })
            .expect(404));
        it('POST status: 400 client uses invalid article_id', () =>
          request
            .post('/api/articles/fgsgs/comments')
            .send({ username: 'butter_bridge', body: 'unlimited tests' })
            .expect(400));
        it('PUT status: 405 handles invalid requests', () =>
          request.put('/api/articles/1/comments').expect(405));
        it('DELETE status: 405 handles invalid requests', () =>
          request.delete('/api/articles/1/comments').expect(405));
        it('PATCH status: 405 handles invalid requests', () =>
          request.patch('/api/articles/1/comments').expect(405));
        describe('/:comment_id', () => {
          it('PATCH status: 200 updates votes (increasing)', () =>
            request
              .patch('/api/articles/1/comments/2')
              .send({ inc_votes: 5 })
              .expect(200)
              .then(({ body }) => {
                expect(body.comment.votes).to.equal(19);
                expect(body.comment.article_id).to.equal(1);
                expect(body.comment.comment_id).to.equal(2);
              }));
          it('PATCH status: 200 updates votes (decreasing)', () =>
            request
              .patch('/api/articles/9/comments/1')
              .send({ inc_votes: -5 })
              .expect(200)
              .then(({ body }) => {
                expect(body.comment.votes).to.equal(11);
                expect(body.comment.comment_id).to.equal(1);
                expect(body.comment.article_id).to.equal(9);
              }));
          it('PATCH status: 200 responds with unmodified comment if inc_votes has not been given', () =>
            request
              .patch('/api/articles/5/comments/15')
              .send({ inc_votes: '' })
              .expect(200)
              .then(({ body }) => {
                expect(body.comment.votes).to.equal(1);
                expect(body.comment.article_id).to.equal(5);
                expect(body.comment.comment_id).to.equal(15);
              }));
          it('PATCH status: 404 uses non-existent comment_id', () =>
            request
              .patch('/api/articles/1/comments/756586960')
              .send({ inc_votes: 10 })
              .expect(404));
          it('PATCH status: 400 client uses invalid comment_id', () =>
            request.patch('/api/articles/1/comments/gfhus'));
          it('PATCH status: 404 uses non-existent article_id', () =>
            request
              .patch('/api/articles/1567/comments/3')
              .send({ inc_votes: 10 })
              .expect(404));
          it('PATCH status: 400 client uses invalid article_id', () =>
            request.patch('/api/articles/1/comments/gfhus'));
          it('PATCH status: 400 client uses invalid inc_votes', () =>
            request
              .patch('/api/articles/1/comments/1')
              .send({ inc_votes: 'gfffh' })
              .expect(400));
          it('DELETE status:204 accepts a delete requests and deletes the article from the databse', () =>
            request
              .delete('/api/articles/9/comments/1')
              .expect(204)
              .then(() => request.get('/api/articles/9/comments'))
              .then(({ body }) => {
                expect(body.comments).to.have.lengthOf(1);
              }));
          it('DELETE status: 404 client uses non-existent article_id', () =>
            request.delete('/api/articles/705/comments/3').expect(404));
          it('DELETE status: 404 client uses non-existent comment_id', () =>
            request.delete('/api/articles/7/comments/325').expect(404));
          it('PUT status: 405 handles invalid requests', () =>
            request.put('/api/articles/1/comments/3').expect(405));
          it('GET status: 405 handles invalid requests', () =>
            request.get('/api/articles/1/comments/3').expect(405));
          it('POST status: 405 handles invalid requests', () =>
            request.post('/api/articles/1/comments/3').expect(405));
        });
      });
    });
  });
  describe('/users', () => {
    it('GET status: 200 responds with an array of user objects', () =>
      request
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
          expect(body.users).to.be.an('array');
        }));
    it('PUT status: 405 handles invalid requests', () =>
      request.put('/api/users').expect(405));
    it('DELETE status: 405 handles invalid requests', () =>
      request.delete('/api/users').expect(405));
    it('PATCH status: 405 handles invalid requests', () =>
      request.patch('/api/users').expect(405));
    it('POST status: 405 handles invalid requests', () =>
      request.post('/api/users').expect(405));
    describe('/:username', () => {
      it('GET status: 200 return user by username', () =>
        request
          .get('/api/users/butter_bridge')
          .expect(200)
          .then(({ body }) => {
            expect(body.user).to.be.an('object');
            expect(body.user).to.have.keys('username', 'avatar_url', 'name');
          }));
      it('GET status: 404 client uses non-existent username', () =>
        request.get('/api/users/fiqsf').expect(404));
      it('PUT status: 405 handles invalid requests', () =>
        request.put('/api/users/:maria').expect(405));
      it('DELETE status: 405 handles invalid requests', () =>
        request.delete('/api/users/:maria').expect(405));
      it('PATCH status: 405 handles invalid requests', () =>
        request.patch('/api/users/:maria').expect(405));
      it('POST status: 405 handles invalid requests', () =>
        request.post('/api/users/:maria').expect(405));
    });
  });
});
