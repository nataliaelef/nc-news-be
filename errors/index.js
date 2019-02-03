exports.handle400 = (err, req, res, next) => {
  const errCodes = ['42703', '23505'];
  const { code, status } = err;
  if (
    errCodes.includes(code)
    || status === 400
    || (code === '23503' && req.method === 'DELETE')
  ) {
    res.status(400).send({ message: err.toString() });
  } else next(err);
};

exports.handle404 = (err, req, res, next) => {
  const errCodes = ['23503'];
  if (errCodes.includes(err.code) || err.status === 404) {
    res.status(404).send({ message: 'Not found' });
  } else next(err);
};

exports.handle405 = (req, res, next) => {
  res.status(405).send({ message: 'Invalid method for this endpoint' });
};
