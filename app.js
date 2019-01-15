const app = require('express')();
const bodyParser = require('body-parser');
const apiRouter = require('./routers/api');
const { handle400, handle404 } = require('./errors');

app.use(bodyParser.json());
app.use('/api', apiRouter);
app.use(handle400);
app.use(handle404);

module.exports = app;
