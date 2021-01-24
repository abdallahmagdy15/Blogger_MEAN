const express = require('express');
const router = require('./routes');
const mongoose = require('mongoose');
const app = express();

const {MONGODB_URI} = process.env;
mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
/// make db indecies*****************

app.use(express.json());


// setup routes
app.use('/', router);


// if any other paths response with not found 404
app.use((req, res, next) => {
  res.status(404).end();
});

// error middleware handler
app.use((err, req, res, next) => {
  console.log(">ERROR>"+err);
  
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(422).json(err);
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

  const {statusCode = 500} = err;
  res.status(statusCode).json(err);
});

const {PORT = 3000} = process.env;
app.listen(PORT, () => {
  console.log('started on ' + PORT);
});
