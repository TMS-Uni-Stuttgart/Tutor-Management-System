import express from 'express';

const app = express();

app.get('/test', (req, res) => {
  res.send('This is an awesome NodeJS server responding.');
});

app.listen(8080);
