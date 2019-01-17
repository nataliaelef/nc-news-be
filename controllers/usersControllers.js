const connection = require('../db/connection');

exports.getUsers = (req, res, next) => {
  connection('users')
    .select()
    .where(req.params)
    .then(users => {
      if (!users.length)
        return Promise.reject({ status: 404, message: 'Username not found' });
      res.status(200).send({ users });
    })
    .catch(next);
};
