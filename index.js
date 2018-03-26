var express = require('express');

const app = express();
app.set('view engine','ejs');

app.use(express.static('./public'));

// index page 
app.get('/', function(req, res) {
    res.render('index');
});

app.get('*',function(req,res)
{
	res.send('Page not Found');
});

app.listen(3000);
console.log('Magic happens at 3000')