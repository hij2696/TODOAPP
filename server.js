const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;

const config = require("./config/key.js");
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

var db;
MongoClient.connect(config.mongoURI, function (err, client) {
    if(err) return console.log(err);
    db = client.db('todoapp');

    app.listen(8080, function () {
        console.log('server is running at 8080');
    });

});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});