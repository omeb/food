var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) { 
    res.sendFile('index.html');
});


app.listen(app.get('port'), function () {
    console.log('app is up and running at port ' + app.get('port'));
});
