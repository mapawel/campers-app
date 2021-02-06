const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const offerRoutes = require('./routes/offer');

const PORT = process.env.PORT || 8000;


app.use(bodyParser.json())

app.use('/api/offer', offerRoutes)

app.listen(PORT, () => {
  console.log(`Camper-app is listening on port: ${PORT}`)
})