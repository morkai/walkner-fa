// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/fa/depKeys',

    clientUrlRoot: '#fa/depKeys',

    topicPrefix: 'fa.depKeys',

    privilegePrefix: 'FA',

    nlsDomain: 'fa-depKeys',

    labelAttribute: '_id',

    defaults: {
      active: true
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);

      return obj;
    }

  });
});
