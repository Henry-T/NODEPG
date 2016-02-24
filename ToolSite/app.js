var express = require('express');
var app = express();
var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

// app.get('/', function (req, res) {
//   res.render('index', {title: 'Express'})
//   // res.send('Hello World!');
// });

app.get('/', function(req, res){
    res.writeHead(200, {'Content-type':'text/html'})
    res.charset = 'utf-8'
    res.write('tool.lolofinil.com')
    res.end()
});

app.get('/android/logparse', function(req, res){
  res.sendfile("index.html");
});


// app.get('/upload', function(req, res) {
//   res.status(200);
//   res.json({'success':true});
// })

app.post('/android/logparse/upload', function(req, res) {
    res.charset = 'utf-8'
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('\\') + 1,
            file_name = old_path.substr(index);
        // console.log(process.cwd()); // PWD undefined    HOMEPATH \Users\Henry
        // console.log(file_name);
        // console.log(file_ext);
        var new_path = path.join(process.cwd(), '/uploads/', file_name + '.' + file_ext);

        fs.readFile(old_path, 'utf-8', function(err, data) {
            // console.log(data);
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.writeHead(500, {'Content-Type':'application/json'})
                        res.json({'info':'日志解析失败'})
                        res.end()
                    } else {
                        res.writeHead(200, {'Content-type':'application/json'})
                        if (data.indexOf("INSTALL_FAILED_INSUFFICIENT_STORAGE")>-1) {
                            res.json({'info':'INSTALL_FAILED_INSUFFICIENT_STORAGE: 内部存储不足'})
                        } else if (data.indexOf("INSTALL_FAILED_OLDER_SDK")>-1) {
                            res.json({'info':'INSTALL_FAILED_OLDER_SDK: apk包的minsdkver大于系统版本'})
                        } else if (data.indexOf("INSTALL_FAILED_USER_RESTRICTED")>-1) {
                            res.json({'info':'INSTALL_FAILED_USER_RESTRICTED: 用户在安全弹框中选择了拒绝'})
                        } else if (data.indexOf("INSTALL_FAILED_CONTAINER_ERROR")>-1)  {
                            res.json({'info':'INSTALL_FAILED_CONTAINER_ERROR: 请开发者将将AndroidManifest.xml中的installLocaltion改为auto (Unity3D修改Install Localtion设置)'})
                        } else if (data.indexOf('INSTALL_FAILED_CPU_ABI_INCOMPATIBLE')>-1) {
                            res.json({'info':'INSTALL_FAILED_CPU_ABI_INCOMPATIBLE: CPU架构不兼容'})
                        } else {
                            res.json({'info':'未发现错误'})
                        }
                        res.end()
                    }
                });
            });
        });
    });
});

app.listen(10001, function () {
  console.log('Example app listening on port 10001!');
});