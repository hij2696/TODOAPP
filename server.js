const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
const config = require("./config/key.js");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
// app.use(express.static(__dirname + '/public'));

var db;
MongoClient.connect(config.mongoURI, { useUnifiedTopology: true }, function (err, client) {
  if(err) return console.log(err);
  db = client.db('todoapp');

  app.listen(8080, () => {
    console.log('server is running at 8080');
  });
});

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/write', (req, res) => { 
  res.render('write.ejs');
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

app.get('/detail/:id', (req, res) => {
  db.collection('post').findOne({ _id : parseInt(req.params.id) }, (err, result) => {
    console.log(result);
    res.render('detail.ejs', { data : result });
  });
});

app.get('/edit/:id', (req, res) => {
  db.collection('post').findOne({ _id : parseInt(req.params.id) }, (err, result) => {
    console.log(result);
    res.render('edit.ejs', { post : result });
  });
});

app.put('/edit', (req, res) => {
  db.collection('post').updateOne({ _id : parseInt(req.body.id) }, { $set : { title : req.body.title, date : req.body.date } }, (err, result) => {
    console.log('Successfully modify');
    res.redirect('/list');
  });
});