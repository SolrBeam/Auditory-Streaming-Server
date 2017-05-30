var express = require('express');
var fs = require('fs');
var ms = require('./index');
var path = require('path');
var multer = require('multer');

var app = express();

// ===================== Dummy Webpage =====================

app.get('/',function(req,res){
	
	return res.redirect('/public/home.html');

});

app.get('/home',function(req,res){
	
	return res.redirect('/public/home.html');

});

app.get('/upload_page',function(req,res){
    
    return res.redirect('/public/upload.html');
});

app.use('/public', express.static(__dirname + '/public'));

// ===================== Streaming =====================

app.get('/music', function(req,res){
	
	// Requested file, query by ID (audio name)
	var fileId = req.query.id; 
	var file = __dirname + '/music/' + fileId;
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
	var file = __dirname + '/music/' + fileId;
	fs.exists(file,function(exists){
		if(exists)
		{
			res.setHeader('Content-disposition', 'attachment; filename=' + fileId);
			res.setHeader('Content-Type', 'application/audio/mpeg3')
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

// ===================== Upload Audio =====================

var storage =   multer.diskStorage({
  // for managing location where file will be saved in streaming server
  destination: function (req, file, callback) {
    callback(null, './music');
  },
  // for managing file name after audio has been uploaded
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + '.mp3');
  }
});
var upload = multer({ storage : storage}).single('audio');

app.post('/upload',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

app.listen(3003, '0.0.0.0', function() {
	console.log('App listening on port: ' + 3003);
});

// app.listen(3003,function(){
// 	console.log('App listening on port 3003!');
// });