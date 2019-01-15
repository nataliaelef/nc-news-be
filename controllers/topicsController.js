const connection = require('../db/connection');

exports.getTopics = (req, res, next) => {
  //console.log('getting topics....');
  connection('topics')
    .select('*')
    .then(topics => {
      res.status(200).send({ topics });
    })
    .catch(console.log);
};
