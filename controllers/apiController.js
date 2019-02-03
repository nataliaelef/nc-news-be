const { endpoints } = require('../endpoints');

exports.getEndpoints = (req, res, next) => {
  res.status(200).send({ endpoints });
};
