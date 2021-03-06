const express = require('express');
const http = require('http');
const url = require('url');
const app = express();
app.use('/', (req, res, next) => {
    console.log('url', req.url);
    console.log('baseUrl', req.baseUrl);
    console.log('originalUrl', req.originalUrl);
    console.log('req',url.parse(req.url))
    console.log('req.query', req.query);
    next();
})

app.use('/test', (req, res, next) => {
    console.log('stacks', app.stack);
    console.log('in test');
    // res.write('wang');
    next();
}, (req, res,next)=>{
    console.log('龟儿子');
    next();
})

app.use('/test/sub', (req, res, next) => {
    console.log('in test sub');
    // res.write('wang');
    next();
})

app.post('/test/sub', (req, res, next) => {
    console.log('in test sub post');
    res.json({name:"test sub"});
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
