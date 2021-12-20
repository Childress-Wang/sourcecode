
var assert = require('assert');
var bytes = require('bytes');
var connect = require('..');

var app = connect();

app.use(connect.multipart({ limit: '20mb' }));

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

describe('connect.multipart()', function(){
  it('should default to {}', function(done){
    app.request()
    .post('/')
    .expect('{}', done)
  })

  it('should accept a limit option', function(done){
    var len = bytes('20mb') + 1;
    var buf = new Buffer(len);

    app.request()
    .post('/')
    .set('Content-Length', len)
    .set('Content-Type', 'multipart/form-data')
    .write(buf)
    .expect(413, done)
  })

  it('should ignore GET', function(done){
    app.request()
    .get('/')
    .set('Content-Type', 'multipart/form-data; boundary=foo')
    .write('--foo\r\n')
    .write('Content-Disposition: form-data; name="user"\r\n')
    .write('\r\n')
    .write('Tobi')
    .write('\r\n--foo--')
    .end(function(res){
      res.body.should.equal('{}');
      done();
    });
  })

  describe('with multipart/form-data', function(){
    it('should populate req.body', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{"user":"Tobi"}');
        done();
      });
    })

    it('should support files', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        assert('Tobi' == req.body.user.name);
        assert('text/plain' == req.files.text.type);
        res.end(req.files.text.name);
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name]"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
      .write('Content-Type: text/plain\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('foo.txt');
        done();
      });
    })

    it('should expose options to multiparty', function(done){
      var app = connect();

      app.use(connect.multipart({
        keepExtensions: true
      }));

      app.use(function(req, res){
        assert('Tobi' == req.body.user.name);
        assert(~req.files.text.path.indexOf('.txt'));
        res.end(req.files.text.originalFilename);
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name]"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('foo.txt');
        done();
      });
    })

    it('should work with multiple fields', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="age"\r\n')
      .write('\r\n')
      .write('1')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{"user":"Tobi","age":"1"}');
        done();
      });
    })

    it('should work with multiple fields of same name', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Bob')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Sam')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{"user":["Tobi","Bob","Sam"]}');
        done();
      });
    })

    it('should support nesting', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name][first]"\r\n')
      .write('\r\n')
      .write('tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name][last]"\r\n')
      .write('\r\n')
      .write('holowaychuk')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="user[age]"\r\n')
      .write('\r\n')
      .write('1')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="species"\r\n')
      .write('\r\n')
      .write('ferret')
      .write('\r\n--foo--')
      .end(function(res){
        var obj = JSON.parse(res.body);
        obj.user.age.should.equal('1');
        obj.user.name.should.eql({ first: 'tobi', last: 'holowaychuk' });
        obj.species.should.equal('ferret');
        done();
      });
    })

    it('should support multiple files of the same name', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        req.files.text.should.have.length(2);
        assert(req.files.text[0]);
        assert(req.files.text[1]);
        res.end();
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.statusCode.should.equal(200);
        done();
      });
    })

    it('should support nested files', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        Object.keys(req.files.docs).should.have.length(2);
        req.files.docs.foo.originalFilename.should.equal('foo.txt');
        req.files.docs.bar.originalFilename.should.equal('bar.txt');
        res.end();
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="docs[foo]"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="docs[bar]"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.statusCode.should.equal(200);
        done();
      });
    })

    it('should next(err) on multipart failure', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        res.end('whoop');
      });

      app.use(function(err, req, res, next){
        err.message.should.equal('Expected alphabetic character, received 61');
        res.statusCode = err.status;
        res.end('bad request');
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.statusCode.should.equal(400);
        res.body.should.equal('bad request');
        done();
      });
    })

    it('should default req.files to {}', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        res.end(JSON.stringify(req.files));
      });

      app.request()
      .post('/')
      .end(function(res){
        res.body.should.equal('{}');
        done();
      });
    })

    it('should defer processing if `defer` is set', function(done){
      var app = connect();

      app.use(connect.multipart({ defer: true }));

      app.use(function(req, res){
        JSON.stringify(req.body).should.equal("{}");
        req.form.on('close', function() {
          res.end(JSON.stringify(req.body));
        });
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="age"\r\n')
      .write('\r\n')
      .write('1')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{"user":"Tobi","age":"1"}');
        done();
      });
    })

    it('should fire "file" event', function(done){
      var app = connect();

      app.use(connect.multipart({ defer: true }));

      app.use(function(req, res){
        var files = 0;
        JSON.stringify(req.body).should.equal("{}");
        req.form.on('file', function(name, file){
          files++;
          file.path.should.not.be.empty;
          file.size.should.equal(20);
          file.headers.should.have.property('content-disposition');
          ['foo','bar'].should.containEql(name);
          ['foo','bar'].should.containEql(file.fieldName);
          ['foo.txt','bar.txt'].should.containEql(file.originalFilename);
        });
        req.form.on('close', function() {
          files.should.equal(2);
          res.end(JSON.stringify(req.body));
        });
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="foo"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here      ')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="bar"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{}');
        done();
      });
    })

    it('should fire "part" event', function(done){
      var app = connect();

      app.use(connect.multipart({ defer: true }));

      app.use(function(req, res){
        var parts = 0;
        JSON.stringify(req.body).should.equal("{}");
        req.form.on('part', function(part){
          parts++;
          part.headers.should.have.property('content-disposition');
          ['age','user'].should.containEql(part.name);
        });
        req.form.on('close', function() {
          parts.should.equal(2);
          res.end(JSON.stringify(req.body));
        });
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="age"\r\n')
      .write('\r\n')
      .write('1')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{"user":"Tobi","age":"1"}');
        done();
      });
    })
  })
})
