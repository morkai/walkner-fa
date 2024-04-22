'use strict';

const ROOT_PATH = `${__dirname}/..`;
const DATA_PATH = `${ROOT_PATH}/data`;
const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

const later = require('@breejs/later');
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

const frontendDictionaryModules = {

};

exports.updater = {
  manifestPath: null,
  packageJsonPath: `${ROOT_PATH}/package.json`,
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: ROOT_PATH,
    timeout: 30000
  },
  versionsKey: 'fa',
  manifests: [
    {
      frontendVersionKey: 'frontend',
      path: null,
      mainJsFile: '/fa-main.js',
      mainCssFile: '/assets/fa-main.css',
      frontendAppData: {
        XLSX_EXPORT: true,
        OFFICE365_TENANT: null,
        CORS_PING_URL: 'https://test.wmes.pl/ping',
        SERVICE_WORKER: null,
        FA_ATTACHMENT_MAX_SIZE: MAX_UPLOAD_SIZE,
        FA_FILE_MAX_SIZE: MAX_UPLOAD_SIZE
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
      '*.added', '*.edited'
    ],
    warning: [
      '*.deleted'
    ],
    error: [
      '*.syncFailed',
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
    'dictionaries.updated',
    '*.added', '*.edited', '*.deleted', '*.synced'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: {
    ...mongodb.mongoClient,
    maxPoolSize: 10
  },
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
    maxAge: 3600 * 24 * 90 * 1000,
    sameSite: 'lax',
    secure: false
  },
  sessionStore: {
    touchInterval: 10 * 60 * 1000,
    touchChance: 0,
    gcInterval: 8 * 3600,
    cacheInMemory: true,
    indexes: [{key: {'data.user._id': 1}}]
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
  privileges: []
};

exports.users = {
  browsePrivileges: ['USER'],
  loginIn: {},
  loginAs: {}
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
  uploadsDest: `${DATA_PATH}/uploads/fa/`,
  maxAttachmentSize: MAX_UPLOAD_SIZE,
  maxFileSize: MAX_UPLOAD_SIZE
};
