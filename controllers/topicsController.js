const connection = require('../db/connection');

exports.getTopics = (req, res, next) => {
  connection('topics')
    .select()
    .then(topics => {
      res.status(200).send({ topics });
    })
    .catch(console.log);
};
