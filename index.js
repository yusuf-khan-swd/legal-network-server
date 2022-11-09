const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const reviewsCollection = client.db('legalNetwork').collection('reviews');

    app.get('/jwt', (req, res) => {
      const email = req.query;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    });

    // Services API END POINT
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

    app.get('/services', async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    // reviews API ENDPOINT
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.get('/reviews', async (req, res) => {
      const id = req.query.serviceId;
      const query = { serviceId: id };
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.get('/my-reviews', verifyToken, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decode.email;

      if (!req.query.email) {
        return res.status(401).send({ message: 'Unauthorize access. Email is missing' });
      }

      if (decodedEmail !== email) {
        return res.status(403).send({ message: 'Forbidden access. Email is not matched.' });
      }

      let query = {};
      if (decodedEmail.includes('@')) {
        query = { email: email };
      }
      else {
        query = { name: email };
      }

      const cursor = reviewsCollection.find(query);
      const userReviews = await cursor.toArray();
      res.send(userReviews);
    });

    app.delete('/my-reviews/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/my-review/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.findOne(query);
      res.send(result);
    });

    app.put('/my-review/:id', async (req, res) => {
      const id = req.params.id;
      const { title, description } = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title: title,
          description: description
        }
      };

      const result = await reviewsCollection.updateOne(query, updateDoc, options);
      res.send(result);

    });


  }
  finally {

  }
}

run().catch(err => console.error('error: ', err))

app.get('/', (req, res) => {
  res.send('Legal Network Server Is Running.');
});

app.listen(port, () => {
  console.log(`Legal network server is running on port: ${port}`);
});