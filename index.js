const express = require('express');
const router = require('./routes');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://localhost:27017/blogsdb_iti', {useNewUrlParser: true, useUnifiedTopology: true});
/// make db indecies*****************

app.use(express.json());
//set uploads as a static directory
app.use(express.static(__dirname + '/public'));


// setup routes
app.use('/', router);

// if any other paths response with not found 404
app.use((req, res, next) => {
  res.status(404).end();
});

// error middleware handler
app.use((err, req, res, next) => {
  console.log(">ERROR*****>"+err);
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
