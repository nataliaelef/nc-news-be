exports.handle400 = (err, req, res, next) => {
  //console.log(err);
  //console.log(err.toString());
  const errCodes = ['42703', '23505'];
  if (errCodes.includes(err.code))
    res.status(400).send({ message: err.toString() });
  else next(err);
};

exports.handle404 = (err, req, res, next) => {
  // console.log(err);
  res.status(404).send({ message: err.message });
};
