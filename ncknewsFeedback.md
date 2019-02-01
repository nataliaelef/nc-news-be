# NC News Feedback

<!-- - require in your endpoints json. No need for fs.readfile DONE -->

<!-- - fix linting errors (add --fix to lint script) DONE-->

## Tests

<!-- 2. /
   /api
   /topics
   POST status:400 if req.body is malformed (not null):
   Error: expected 400 "Bad Request", got 201 "Created"

   - add `notNullable()` DONE -->

<!-- 3. /
   /api
   /topics/:topic/articles
   POST status:201 if body is malformed (not null):
   Error: expected 400 "Bad Request", got 404 "Not Found"

   - notNullable DONE -->

<!-- 4. /
   /api
   /topics/:topic/articles
   POST status:404 adding an article to a non-existent topic:
   Error: expected 404 "Not Found", got 400 "Bad Request"

   - Not a priority: but can check error constraint in handle400 DONE -->

<!--  5. /
   /api
   /topics/:topic/articles
   invalid methods respond with 405:
   Error: expected 405 "Method Not Allowed", got 404 "Not Found"


    - group routes together with `.route`, then add handle405 DONE-->

<!-- 8. /
   /api
   /articles
   GET status:200 responds with all articles with correct keys:

   AssertionError: expected { Object (author, title, ...) } to have keys 'author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', and 'topic'

   - expected - actual

   [
   "article_id"
   "author"

   - "body"
     "comment_count"
     "created_at"
     "title"
     "topic"

   - select('article_id' ...), except "body"  DONE-->

<!-- 9. /
   /api
   /articles/:article_id
   GET status:200 responds with a single article object:
   TypeError: Cannot convert undefined or null to object

   - have separate function for "getArticleById"  DONE-->

<!-- 11. /
    /api
    /articles/:article_id
    PATCH status:200 and an updated article when given a body including a valid "inc_votes" (VOTE UP):
    AssertionError: expected undefined to equal 101

    - use array destructuring: ([article]) => blahblah DONE-->

<!-- 12. /
    /api
    /articles/:article_id
    PATCH status:200 responds with an updated article when given a body including a valid "inc_votes" (VOTE DOWN):
    AssertionError: expected undefined to equal 99

    - same as above DONE-->

<!-- 13. /
    /api
    /articles/:article_id
    PATCH status:200s no body responds with an unmodified article:
    Error: expected 200 "OK", got 404 "Not Found"

    - test for this DONE-->

14. / NOT SURE ABOUT THIS ONE!!!
    /api
    /articles/:article_id
    DELETE status:204 and removes the article when given a valid article_id:
    Error: expected 204 "No Content", got 400 "Bad Request"


    - check result of deletion, reject promise if not correct

<!-- 16. /
    /api
    /articles/:article_id
    DELETE status:404 when given a non-existent article_id:
    Error: expected 404 "Not Found", got 204 "No Content"

- same as above DONE-->

<!-- 17. /
    /api
    /articles/:article_id
    DELETE responds with 400 on invalid article_id:
    Error: expected 400 "Bad Request", got 404 "Not Found"

- Not a priority: request with /articles/banana -> 400 so check err.constraint DONE-->

<!-- 18. /
    /api
    /articles/:article_id
    invalid methods respond with 405:
    Error: expected 405 "Method Not Allowed", got 404 "Not Found"

- same as above DONE  -->

<!-- 20. /
    /api
    /api/articles/:article_id/comments
    GET can return the data in ascending order:

    AssertionError: expected 100 to equal -100

    - expected - actual

    -100
    +-100  DONE-->

<!-- 21. /
    /api
    /api/articles/:article_id/comments
    POST responds with a 404 when given a non-existent article id:
    Error: expected 404 "Not Found", got 400 "Bad Request"

    - checking error, and handle in 404 block DONE -->

<!-- 22. /
    /api
    /api/articles/:article_id/comments
    POST responds with a 400 when given an invalid article id:
    Error: expected 400 "Bad Request", got 404 "Not Found"

    - /articles/banana/comments -> 400
      `if (Number.isNaN(+article_id)) return Promise.reject()` DONE -->

<!-- 23. /
    /api
    /api/articles/:article_id/comments
    invalid methods respond with 405:
    Error: expected 405 "Method Not Allowed", got 404 "Not Found"

    - same as above DONE -->

<!-- 24. /
    /api
    /articles/:article_id/comments/:comment_id
    PATCH responds with a 200 and an updated comment when given a body including a valid "inc_votes" (VOTE DOWN):
    AssertionError: expected undefined to equal 13
    - same as above DONE-->

<!-- 28. /
    /api
    /articles/:article_id/comments/:comment_id
    PATCH with no body responds with an unmodified comment:
    Error: expected 200 "OK", got 404 "Not Found"

    - Not a priority: if patch has no req.body -> 200, with unchanged comment DONE-->

<!-- 29. /
    /api
    /articles/:article_id/comments/:comment_id
    PATCH responds with 400 if invalid article id is used:
    Error: expected 400 "Bad Request", got 404 "Not Found"


    - put article_id from req.params into `where` clause DONE -->

<!-- 31. /
    /api
    /articles/:article_id/comments/:comment_id
    DELETE responds with 404 if given a non-existent article_id:
    Error: expected 404 "Not Found", got 204 "No Content"

    - same as above DONE -->

<!-- 32. /
    /api
    /articles/:article_id/comments/:comment_id
    DELETE responds with 404 if given a non-existent comment_id:
    Error: expected 404 "Not Found", got 204 "No Content"

    - same as above DONE -->

<!-- 33. /
    /api
    /articles/:article_id/comments/:comment_id
    invalid methods respond with 405:
    Error: expected 405 "Method Not Allowed", got 404 "Not Found"

    - same as above  DONE-->

<!-- 34. /
    /users/:username
    GET responds with a 200 and a user object when given a valid username:
    AssertionError: expected undefined to deeply equal { Object (username, name, ...) }


    - destructure the array DONE-->

<!-- 35. /
    /users/:username
    invalid methods respond with 405:
    Error: expected 405 "Method Not Allowed", got 404 "Not Found"

- same as above DONE-->
