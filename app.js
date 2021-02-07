require('dotenv-safe').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const offerRoutes = require('./routes/offer');

const PORT = process.env.PORT || 8000;
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.use('/api/offer', offerRoutes)

app.use((error, req, res, next) => {
  console.log('AIN ERROR HANDLER ON SERVER: ', error)
  res.status(500).json(error)
})


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('DB conneced!')
  app.listen(PORT, () => {
    console.log(`Camper-app is listening on port: ${PORT}`)
  })
});
// kpaUM4f2iw9yLxn