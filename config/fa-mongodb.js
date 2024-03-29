'use strict';

module.exports = {
  uri: process.env.FA_MONGODB_URI || 'mongodb://127.0.0.1:27017/walkner-fa',
  keepAliveQueryInterval: 15000,
  mongoClient: {
    minPoolSize: 1,
    maxPoolSize: 10,
    noDelay: true,
    keepAlive: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 0,
    forceServerObjectId: false,
    writeConcern: {
      w: 1,
      wtimeoutMS: 15000
    },
    autoIndex: process.env.NODE_ENV !== 'production',
    enableUtf8Validation: false
  }
};

if (process.env.FA_MONGODB_REPLICA_SET)
{
  module.exports.mongoClient.replicaSet = process.env.FA_MONGODB_REPLICA_SET;
}
