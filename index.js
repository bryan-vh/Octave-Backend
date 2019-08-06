let express = require('express');
let multer = require('multer');
let path = require('path');
let bodyParser = require('body-parser');
let cors = require('cors');
var request = require('request');
var fs = require('fs');

let app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let CLIENT_ID = 'ab53dc0007b34a1f9960b3e09715875d';
let CLIENT_SECRET = '27d14e69cbfb41e1bdb1b4e9eee9a705';
let REDIRECT_URI = 'http://localhost:3000/';

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

let upload = multer({storage: storage}).single('audio');

var port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Hello from Octave Express Server!');
});

app.post('/search', (req, res) => {
    var search = req.body.search;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    request.post(authOptions, function(error, response, body){
        if(!error && response.statusCode === 200){
            var token = body.access_token;
            var query = `q=${search}&type=track&limit=7`;
            var options = {
                url: 'https://api.spotify.com/v1/search?' + query,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };

            request.get(options, function(error, response, body){
                if(!error && response.statusCode === 200){
                    res.send({
                        body: body,
                        token: token
                    });
                }
            });
        }
    });
});

app.post('/song', (req, res) => {
    var title = req.body.title;
    var artist = req.body.artist;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    request.post(authOptions, function(error, response, body){
        if(!error && response.statusCode === 200){
            var token = body.access_token;
            var query = `q=artist:${artist}%20track:${title}&type=track&limit=1`
            var options = {
                url: 'https://api.spotify.com/v1/search?' + query,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };

            request.get(options, function(error, response, body){
                if(!error && response.statusCode === 200){
                    res.send({
                        body: body,
                        token: token
                    });
                }
            });
        }
    });
});

app.post('/upload', (req, res) => {
    upload(req, res, function(err){
        if(err){
            return res.send(err);
        }
        else{
            return res.json({
                file: req.file
            })
        }
    });
});

app.use('/', express.static('public/uploads'));

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})