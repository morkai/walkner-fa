'use strict';

const frontendConfig = require('./fa-frontend');

exports.id = 'fa-static';

exports.modules = [
  'h5-express/static',
  'httpServer'
];

exports.httpServer = {
  expressId: 'h5-express/static',
  host: '127.0.0.1',
  port: 81
};

exports['h5-express/static'] = {
  staticPath: frontendConfig.express.staticPath,
  staticBuildPath: frontendConfig.express.staticBuildPath,
  ejsAmdHelpers: frontendConfig.express.ejsAmdHelpers
};
