const app = require('express')();
const apiRouter = require('./routers/api');

app.use('/api', apiRouter);

module.exports = app;
