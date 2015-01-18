// 树莓派图片检查并上传
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var qn = require('qn');
var config = require('./config');

var client = qn.create(config.upload);

//检查目录是否存在
var dataPathExists = fs.existsSync(config.dist);
if (!dataPathExists) {
    console.log('data目录未创建，已自动帮您创建目录：' + config.dist);
    mkdirp(config.dist);
}

if (!fs.existsSync(config.source)) {
    console.log('文件[' + config.source + ']不存在');
    return;
}

var lastMd5 = (function() {
    if (fs.existsSync(config.md5Path)) {
        return fs.readFileSync(config.md5Path, 'utf8');
    } else {
        return '';
    }
}());
function md5File(filename) {
  var sum = crypto.createHash('md5');
  sum.update(fs.readFileSync(filename));
  return sum.digest('hex');
};

function read() {
    var md5 = md5File(config.source);
    if (md5 !== lastMd5) {
        console.log('文件有变化，新文件md5：' + md5)
        lastMd5 = md5;
        fs.writeFileSync(config.md5Path, md5);
        var index = config.source.lastIndexOf('.');
        var n = config.source.substr(0, index);
        var s = config.source.substr(index + 1, config.source.length);
        //TODO 用moment
        var d = new Date();
        var year = d.getFullYear();
        var month = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
        var date = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        var hour = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        var minute = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        var second = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
        var dat = year + '' + month + '' + date + '' + hour + '' + minute + '' + second;
        var newFile = n + dat + '.' + s;
        //fs.writeFileSync(path.join('./data', newFile), fs.readFileSync(config.source));
        client.uploadFile(path.join(__dirname, config.source), function(err, qf) {
            if (err) {
                console.log(err, qf, '上传出错了');
                var log = 'Error: ' + err + JSON.stringify(qf) + '@' + Date.now();
                fs.appendFile(config.logPath, log, function(err) {
                    //console.log(err)
                });
                return;
            }
            var url = qf.url;
            var time = qf['x:ctime'];

            var log = url + ' : ' + time + '\n';
            fs.appendFile(config.logPath, log, function(err) {
                console.log(err)
            });
            //console.log(qf);
        });
    } else {
        console.log('文件没有变化');
    }
}

setInterval(function() {
    read();
}, 5000);