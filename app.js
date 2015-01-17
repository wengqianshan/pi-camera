// 树莓派图片检查并上传
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
//var request = require('request');//需要安装
var mkdirp = require('mkdirp');//需要安装
//var gaze = require('gaze');
var qn = require('qn');

var source = './a.jpg';//要监听的文件
var md5Path = './md5.txt';//md5存放文件
var client = qn.create({
    accessKey: '_IklVVoJ6zfKvykBMpYZGix7wwJflOotajvcOv6X',
    secretKey: 'wN9K9PqcWYmcX9e0P22ynZGzm_DU8rQfZLeJ_cNc',
    bucket: 'fudiup',
    domain: 'http://7u2lyd.com1.z0.glb.clouddn.com',
    timeout: 3600000, // default rpc timeout: one hour, optional
});

//检查目录是否存在
var dist = path.resolve(__dirname, 'data');//变化的文件存放目录
var dataPathExists = fs.existsSync(dist);
if (!dataPathExists) {
    console.log('data目录未创建，已自动帮您创建目录：' + dist);
    mkdirp(dist);
}

if (!fs.existsSync(source)) {
    console.log('文件[' + source + ']不存在');
    return;
}

var lastMd5 = (function() {
    if (fs.existsSync(md5Path)) {
        return fs.readFileSync(md5Path, 'utf8');
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
    var md5 = md5File(source);
    if (md5 !== lastMd5) {
        console.log('文件有变化，新文件md5：' + md5)
        lastMd5 = md5;
        fs.writeFileSync(md5Path, md5);
        var index = source.lastIndexOf('.');
        var n = source.substr(0, index);
        var s = source.substr(index + 1, source.length);
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
        //fs.writeFileSync(path.join('./data', newFile), fs.readFileSync(source));
        client.uploadFile(path.join(__dirname, source), function(err, qf) {
            var url = qf.url;
            var time = qf['x:ctime'];

            var log = url + ' : ' + time + '\n';
            fs.appendFile(path.join(__dirname, './log.txt'), log, function(err) {
                console.log(err)
            });
            //console.log(qf);
        });
        //TODO 上传文件, 转移目录
        /*request.post({
            url: 'http://',
            formData: {
                file: fs.createReadStream(path.join(__dirname + source))
            }
        }, function(err, response, body) {

        });*/
    } else {
        //console.log('文件没有变化');
    }
}

/*read();
fs.watch(source, function(event, filename) {
    console.log(event);
    console.log(filename)
    if (event === 'change') {
        read();
    }
});*/

setInterval(function() {
    read();
}, 5000);

/*gaze(source, function(err, watcher) {
    if (err) {
        console.log('gaze出错啦：' + err);
        return;
    }
    this.on('changed', function(filepath) {
        console.log(filepath + ' 发生改变');
        read();
    });
})*/