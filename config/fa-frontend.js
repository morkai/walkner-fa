'use strict';

const DATA_PATH = `${__dirname}/../data`;

const fs = require('fs');
const later = require('later');
const ports = require('./fa-ports');
const mongodb = require('./fa-mongodb');

later.date.localTime();

try
{
  require('pmx').init({
    ignore_routes: [/socket\.io/] // eslint-disable-line camelcase
  });
}
catch (err) {} // eslint-disable-line no-empty

exports.id = 'fa-frontend';

Object.assign(exports, require('./fa-common'));

exports.modules = [
  'watchdog/memoryUsage',
  'updater',
  {id: 'h5-mongoose', name: 'mongoose'},
  'settings',
  'events',
  'pubsub',
  'user',
  'pings',
  {id: 'h5-express', name: 'express'},
  'users',
  'html2pdf',
  'printing',
  'xlsxExporter',
  'logs',
  'mail/sender',
  'sms/sender',
  'fa',
  'httpServer',
  'sio'
];

const manifestTemplates = {
  main: fs.readFileSync(`${__dirname}/fa-manifest.appcache`, 'utf8')
};
const frontendDictionaryModules = {

};

exports.updater = {
  manifestPath: `${__dirname}/fa-manifest.appcache`,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: `${__dirname}/../`,
    timeout: 30000
  },
  versionsKey: 'fa',
  manifests: [
    {
      frontendVersionKey: 'frontend',
      path: '/manifest.appcache',
      mainJsFile: '/fa-main.js',
      mainCssFile: '/assets/fa-main.css',
      template: manifestTemplates.main,
      frontendAppData: {
        XLSX_EXPORT: process.platform === 'win32',
        OFFICE365_TENANT: null,
        CORS_PING_URL: 'https://test.wmes.pl/ping',
        SERVICE_WORKER: null
      },
      dictionaryModules: frontendDictionaryModules
    }
  ]
};

exports.events = {
  collection: app => app.mongoose.model('Event').collection,
  insertDelay: 1000,
  topics: {
    debug: [

    ],
    warning: [

    ],
    error: [
      'app.started'
    ]
  },
  blacklist: [

  ]
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 80,
  availabilityTopics: []
};

exports.httpsServer = {
  host: '0.0.0.0',
  port: 443,
  key: `${__dirname}/https.key`,
  cert: `${__dirname}/https.crt`,
  availabilityTopics: exports.httpServer.availabilityTopics
};

exports.sio = {
  httpServerIds: ['httpServer'],
  socketIo: {
    pingInterval: 10000,
    pingTimeout: 5000
  }
};

exports.pubsub = {
  statsPublishInterval: 60000,
  republishTopics: [
    'ping',
    'sockets.connected', 'sockets.disconnected',
    'dictionaries.updated',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'settings.updated.**',
    'printing.**'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 10
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500
};

exports.express = {
  staticPath: `${__dirname}/../frontend`,
  staticBuildPath: `${__dirname}/../frontend-build`,
  sessionCookieKey: 'fa.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: 3600 * 24 * 30 * 1000
  },
  sessionStore: {
    touchInterval: 10 * 60 * 1000,
    touchChance: 0,
    gcInterval: 8 * 3600,
    cacheInMemory: false
  },
  cookieSecret: '1ee7\\/\\/mes',
  ejsAmdHelpers: {
    _: 'underscore',
    $: 'jquery',
    t: 'app/i18n',
    time: 'app/time',
    user: 'app/user',
    forms: 'app/core/util/forms'
  },
  textBody: {limit: '1mb'},
  jsonBody: {limit: '1mb'},
  routes: [
    require('../backend/routes/core'),
    require('../backend/routes/fix')
  ]
};

exports.user = {
  userInfoIdProperty: '_id',
  localAddresses: [/^192\.168\.1\./],
  privileges: [
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE'
  ]
};

exports.users = {
  browsePrivileges: ['USER']
};

exports['mail/sender'] = {
  from: 'WMES Bot <fa@localhost>'
};

exports['sms/sender'] = {

};

exports.html2pdf = {
  storagePath: `${DATA_PATH}/html2pdf/`
};

exports.fa = {
  uploadsDest: `${DATA_PATH}/uploads/fa/`
};
