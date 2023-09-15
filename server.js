const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;

const config = require("./config/key.js");
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

var db;
MongoClient.connect(config.mongoURI, { useUnifiedTopology: true }, function (err, client) {
  if(err) return console.log(err);
  db = client.db('todoapp');

  app.listen(8080, () => {
    console.log('server is running at 8080');
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/write', (req, res) => { 
  res.sendFile(__dirname + '/write.html')
});

app.post('/add', (req, res) => {
  db.collection('counter').findOne( { name : 'numberOfPosts' }, (err, result) => {
    var totalPost = result.totalPost;
    db.collection('post').insertOne( { _id : (totalPost + 1), title : req.body.title, date : req.body.date }, (err, result) => {
      console.log('Successfully saved');
      db.collection('counter').updateOne( { name : 'numberOfPosts' }, { $inc : {totalPost : 1} }, (err, result) => {
        if (err) { return console.log(err) };
      });
      res.send('Successfully sent');
    });
  });
});

app.get('/list', (req, res) => {
  db.collection('post').find().toArray( (err, result) => {
    console.log(result);
    res.render('list.ejs', { posts : result });
  });
});

app.delete('/delete', (req, res) => {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, (err, result) => {
    console.log('deletion Successful');
    res.status(200).send({ message : 'success!' });
  });
});