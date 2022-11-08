const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorize access. Headers Missing' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decode) {
    if (err) {
      return res.status(401).send({ message: 'Unauthorize access. Token is not valid' });
    }
    req.decode = decode;
    next();
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tjl9nwy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const servicesCollection = client.db('legalNetwork').collection('services');

    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    app.get('/popular-services', async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const popularServices = await cursor.limit(3).toArray();
      res.send(popularServices);
    });
  }
  finally {

  }
}

run().catch(err => console.error('error: ', err))

app.get('/jwt', (req, res) => {
  const email = req.query;
  const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  res.send({ token });
});

app.get('/reviews', verifyToken, (req, res) => {
  const email = req.query.email;
  const decodedEmail = req.decode.email;

  if (!req.query.email) {
    return res.status(401).send({ message: 'Unauthorize access. Email is missing' });
  }

  if (decodedEmail !== email) {
    return res.status(403).send({ message: 'Forbidden access. Email is not matched.' });
  }

  res.send({ review: 'This is review page' });

});

app.get('/', (req, res) => {
  res.send('Legal Network Server Is Running.');
});

app.listen(port, () => {
  console.log(`Legal network server is running on port: ${port}`);
});