const connection = require('../db/connection');

exports.getUsers = (req, res, next) => {
  connection('users')
    .select()
    .then((users) => {
      if (!users) return Promise.reject({ status: 404, message: 'Not found' });
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  connection('users')
    .select()
    .where(req.params)
    .then((user) => {
      if (!user.length) return Promise.reject({ status: 404, message: 'Not found' });
      res.status(200).send({ user: user[0] });
    })
    .catch(next);
};
