"use strict";

var config = {
  db: {
    connectStringList: [
      'mongodb://baic-epc:baic-epc@127.0.0.1:27017/baic-epc'
    ]
  },
  serverMap: {
    epcmServer: {
      host: '10.20.253.166',
      port: 8080,
      requestPrefix: '/baic-epcm'
    },
    coreServer: {
      host: '10.20.253.166',
      port: 8080,
      requestPrefix: '/baic-core'
    },
    epcServer: {
      host: '10.20.253.166',
      port: 8080
    }
  },
  localServerUrlMap: {
    index: 'https://epc.baicmotor.com/epc/catalog'
  },
  partnerApp: {
    epcmServer: {
      host: '127.0.0.1',
      port: 8011
    },
    fileServer: {
      protocol:'http',
      host: '10.20.253.167',
      port: 80
    }
  },
  redisSession: {
    app: 'baic', //所属总作用域
    cookie: {
      path: '/', //cookie路径
      httpOnly: true
    },
    host: '127.0.0.1',
    port: 6379,
    options: {
      password: 'baic-epc'
    },
    namespace: '', //redis key前缀
    ttl: 60 * 60, //过期时间，单位s，默认7200
    wipe: 60 * 10, //定期清除超时session间隔时间，单位s，默认600
    trustProxy: false //只接受https cookies
  },
  redisCache: {
    host: '127.0.0.1',
    port: 6379,
    password: 'baic-epc',
    prefix: 'EPC:',
    expireTime: (60 * 60 * 24) * 7 // 单位s
  },
  tokenSaltList: [
    'M3kReE',
    '7EwVBP',
    'ri4AcK',
    'Ted2OC',
    'PqxIUl',
    'oIJsTN'
  ],
  isLocal: false,
  helpDocUrl: 'https://res.epc.baicmotor.com/baic/manual/epc/',
  path: 'https://epc.baicmotor.com',
  toEpcmUrl: 'https://epcm.epc.baicmotor.com',
  jsonpUrl: 'https://res.epc.baicmotor.com/doc/${brandCode}/'
};


module.exports = config;