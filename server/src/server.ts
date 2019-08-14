import express from 'express';
import mongoose from 'mongoose';

const app = express();
mongoose
  .connect('mongodb://localhost:27017/tms', {
    useNewUrlParser: true,
    // auth: { user: 'root', password: 'example' },
  })
  .catch(err => {
    console.error(`[${err.name}] Connection to MongoDB database failed.`);
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
  console.log('Connected to MongoDB database.');
});

app.get('/test', (req, res) => {
  res.send('This is an awesome NodeJS server responding.');
});

app.listen(8080);
