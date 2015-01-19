var path = require('path');
module.exports = {
    source: './a.jpg',
    saveLoal: true,//是否保存到本地
    dist: path.join(__dirname, 'data'),// saveLoal为true才生效
    md5Path: path.join(__dirname, './md5.txt'),
    logPath: path.join(__dirname, './log.txt'),
    upload: {
        accessKey: 'xxx',
        secretKey: 'vvvv',
        bucket: 'fudiup',
        domain: 'http://7u2lyd.com1.z0.glb.clouddn.com',
        timeout: 3600000
    }
}