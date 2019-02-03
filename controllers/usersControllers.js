const connection = require('../db/connection');

exports.getUsers = (req, res, next) => {
  connection('users')
    .select()
    .then((users) => {
      if (!users) return Promise.reject({ status: 404, message: 'Not found' });
      return res.status(200).send({ users });
    })
    .catch(next);
  return null;
};

exports.getUserByUsername = (req, res, next) => {
  connection('users')
    .select()
    .where(req.params)
    .then((user) => {
      if (!user.length) return Promise.reject({ status: 404, message: 'Not found' });
      return res.status(200).send({ user: user[0] });
    })
    .catch(next);
  return null;
};
