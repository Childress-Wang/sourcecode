const http = require('http');

http.createServer((req, res) => {
    console.log('req.url', req.url);
    console.log('req.baseUrl', req.baseUrl);
    console.log('req.originalUrl', req.originalUrl);
    console.log('req.params', req.params);
    res.end('hahah');
}).listen(8083, ()=>{
    console.log('server is listing on port 8083')
})