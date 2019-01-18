const app = require('./app');

const { PORT = 9090 } = process.env;

app.listen(PORT, () => console.log(`listening on ${PORT}`));

// const PORT = 9090;

// app.listen(PORT, err => {
//   if (err) console.log(err);
//   else console.log(`Listening in ${PORT}`);
// });
