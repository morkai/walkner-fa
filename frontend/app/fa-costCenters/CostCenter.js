// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  t,
  Model,
  userInfoTemplate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/fa/costCenters',

    clientUrlRoot: '#fa/costCenters',

    topicPrefix: 'fa.costCenters',

    privilegePrefix: 'FA',

    nlsDomain: 'fa-costCenters',

    labelAttribute: '_id',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);
      obj.owner = userInfoTemplate({userInfo: obj.owner, noIp: true});

      return obj;
    }

  });
});
