    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var fs = require('fs');
    var ms = require('./index');
    var path = require('path');

    // ===================== Dummy Webpage =====================

    app.get('/',function(req,res){
        
        return res.redirect('/public/home.html');

    });

    app.get('/home_page',function(req,res){
        
        return res.redirect('/public/home.html');

    });

    app.get('/upload_page',function(req,res){
        
        return res.redirect('/public/upload.html');
    });

    app.use('/public', express.static(__dirname + '/public'));
    app.use(express.static('../client'));
    app.use(bodyParser.json()); 
    app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", true);
        next();
    });

    // ===================== Streaming =====================

    app.get('/streaming', function(req,res){
        
        // Requested file, query by ID (audio name)
        var fileId = req.query.id; 
        var file = __dirname + '/uploads/' + fileId;
        fs.exists(file,function(exists){
            if(exists)
            {
                // function to make the audio can be skipped anywhere
                ms.pipe(req, res, file, path.extname(fileId));
                
                // old way, can't skip
                // var rstream = fs.createReadStream(file);
                // rstream.pipe(res);
            }
            else
            {
                res.send("Its a 404");
                res.end();
            }
        
        });
        
    });

    // ===================== Download Audio =====================

    app.get('/download', function(req,res){

        // Requested file, query by ID (audio name)
        var fileId = req.query.id;
        var file = __dirname + '/uploads/' + fileId;
        fs.exists(file,function(exists){
            if(exists)
            {
                res.setHeader('Content-disposition', 'attachment; filename=' + fileId);
                res.setHeader('Content-Type', 'application/audio/mpeg3');
                var rstream = fs.createReadStream(file);
                rstream.pipe(res);
            }
            else
            {
                res.send("Its a 404");
                res.end();
            }
        });
        
        
    });

// ============================= Upload ==============================

    /** Serving from the same express Server
    No cors required */
    app.use(express.static('../client'));
    app.use(bodyParser.json());  

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
        }
    });

    var upload = multer({ //multer settings
                    storage: storage
                }).single('file');

    /** API path that will upload the files */
    app.post('/upload', function(req, res) {
        upload(req,res,function(err){
            console.log(req.file);
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
             res.json({error_code:0,err_desc:null});
        });
    });

    app.listen('3003', function(){
        console.log('running on 3003...');
    });