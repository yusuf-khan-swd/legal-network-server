const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get('/jwt', (req, res) => {
  const email = req.query;
  const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  res.send({ token });
});

app.get('/', (req, res) => {
  res.send('Legal Network Server Is Running.');
});

app.listen(port, () => {
  console.log(`Legal network server is running on port: ${port}`);
});