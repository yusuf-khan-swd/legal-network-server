const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Legal Network Server Is Running.');
});

app.listen(port, () => {
  console.log(`Legal network server is running on port: ${port}`);
});