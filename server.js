const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const app = express()
const User = require('./models/User');
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000

mongoose.connect('mongodb://localhost/bz-auth')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello World!'))

var jwt_secret = 'beingzerorocks';

var users = [];

/* AUTH API */
app.post('/api/users', (req, res) => {
    console.log(req.body);
    var userInput = req.body;
    var newUser = new User(userInput);
    var token = jwt.sign(getPayload(req), jwt_secret);
    jwt.sign(payload, jwt_secret, {}, function(err, token) {
        newUser.save(function(err) {
            res.status(200).json({ 'token': token, 'user': newUser.toJSON() });
        })
    });
})

function getPayload(req) {
    return { iss: req.hostname, sub: req.email }
}

app.post('/api/users/login', (req, res) => {
    var userInput = req.body;
    User.findOne({ email: userInput.email }, function(err, user) {
        //TODO: Match Given Password with Stored DB Password
        var passwordsMatch = true;

        if (!passwordsMatch)
            return res.status(400).json({ message: 'Invalid Password/Username' });
        var token = jwt.sign(getPayload(req), jwt_secret);
        return res.status(200).json({ 'token': token, 'email': user.email });
    })
})

app.get('/api/users', (req, res) => {
    var users = {};
    User.find({}, function(err, users) {
        res.send(users);
    });
})


app.get('/api/greeting/public', function(req, res) {
    res.json({ message: 'I am public resource' });
})

app.get('/api/greeting/authenticated', function(req, res) {
    if (!req.headers.authorization)
        return res.status(403).json({ 'message': 'You need to be logged in!' });
    var parts = req.headers.authorization.split(' ');
    if (parts.length <= 1)
        return res.status(403).json({ 'message': 'You need to be provide valid token!' });
    var token = parts[1];
    console.log(token);
    jwt.verify(token, jwt_secret, function(err, decoded) {
        console.log(decoded);
        return res.json({ message: 'I am authenticated resource' });
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))