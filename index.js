const express = require('express');
const router = require('./routes');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors')

const { MONGODB_URI } = process.env;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongodb Connected !'))
  .catch((e) => console.log('caught error while connecting to db : ', e));

app.use(express.json());
//app.use(express.static(__dirname+ '/public'));

app.use(cors())

// setup routes
app.use('/', router);
app.use('/test', (req, res, next) => {
  res.json({ "test": "success" })
})

// if any other paths response with not found 404
app.use((req, res, next) => {
  res.status(404).end();
});

//console.log

// error middleware handler
app.use((err, req, res, next) => {
  console.log(">ERROR>" + err.message);

  if (err instanceof mongoose.Error) {
    res.status(422).json(err.message);
  }
  if (err.code == 11000) {
    res.status(422).json({
      statusCode: 'validatorError', property: err.keyValue,
    });
  };
  if (err.message === 'AUTHENTICATION_REQUIRED') {
    res.status(401).json({
      statusCode: 'validatorError', property: err.keyValue,
    });
  };

  const { statusCode = 500 } = err;
  res.status(statusCode).json(err.message);
});

const { PORT = 3000 } = process.env;
app.listen(PORT, () => {
  console.log('started on ' + PORT);
});
