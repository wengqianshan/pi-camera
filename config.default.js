var path = require('path');
module.exports = {
    source: 'a.jpg',
    dist: path.join(__dirname, 'data'),
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