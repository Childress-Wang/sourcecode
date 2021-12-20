const express = require('express');
const http = require('http');

const app = express();
app.use('/', (req, res, next) => {
    console.log('url', req.url);
    console.log('baseUrl', req.baseUrl);
    console.log('originalUrl', req.originalUrl);
    next();
})

app.use('/test', (req, res, next) => {
    console.log('in test');
    // res.write('wang');
    next();
})

app.use('/test2', (req, res, next) => {
    console.log('in test2');
    // res.json({name:"dsds"});
    next();
})

app.post('/test2', (req, res, next) => {
    console.log('in post test2');
    // res.json({name:"test2"});
    next();
})
app.post('/test2/sub', (req, res, next) => {
    console.log('in post test2 sub');
    res.json({name:"test2"});
})

app.listen(8081,() => {
    console.log('server is listening on port 8081');
});
