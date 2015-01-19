// 树莓派图片检查并上传
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var qn = require('qn');
var lwip = require('lwip');
var moment = require('moment');
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

function process(md5) {
    
    //是否保存到本地
    if (config.saveLoal) {
        var ext = path.extname(config.source);
        var base = path.basename(config.source, ext);
        var d = moment().format('YYYYMMDDHHmmss');
        var newFile = base + d + ext;
        fs.writeFileSync(path.join(config.dist, newFile), fs.readFileSync(config.source));    
    }
    //上传到网络
    client.uploadFile(config.source, function(err, qf) {
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
}

function read() {
    //缩小图片对比像素
    lwip.open(config.source, function(err, image) {
        image.resize(20, 20, function(err, image) {
            image.toBuffer('jpg', function(err, buffer) {
                //文件md5
                var sum = crypto.createHash('md5');
                sum.update(buffer);
                var md5 = sum.digest('hex');
                if (md5 !== lastMd5) {
                    console.log('文件有变化，新文件md5：' + md5)
                    lastMd5 = md5;
                    fs.writeFileSync(config.md5Path, md5);
                    process(md5);
                    /*image.writeFile('./output.jpg', function(err) {
                        console.log(err)
                    })*/
                } else {
                    console.log('文件没有变化:lwip');
                }
            })
        })
    });
}

setInterval(function() {
    read();
}, 5000);