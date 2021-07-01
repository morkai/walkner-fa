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

    urlRoot: '/fa/assetGroups',

    clientUrlRoot: '#fa/assetGroups',

    topicPrefix: 'fa.assetGroups',

    privilegePrefix: 'FA',

    nlsDomain: 'fa-assetGroups',

    labelAttribute: 'evalGroup5',

    defaults: {
      active: true
    },

    getLabel: function()
    {
      return this.get('evalGroup5').substring(0, 7);
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);
      obj.depRate = (Math.round(obj.depRate * 100) / 100).toLocaleString() + '%';

      return obj;
    }

  });
});
