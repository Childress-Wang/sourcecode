const connect = require('connect');
const url = require('url');
const app = connect();
app.use('/', (req, res, next) => {
    console.log('url', req.url);
    console.log('baseUrl', req.baseUrl);
    console.log('originalUrl', req.originalUrl);
    console.log('req',url.parse(req.url))
    console.log('req.query', req.query);
    console.log('req.params', req.params);
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
    res.write('im sure')
    next();
})

app.listen(8081,() => {
    console.log('server is listening on port 8081');
});
