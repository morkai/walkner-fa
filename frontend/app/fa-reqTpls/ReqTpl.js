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

    urlRoot: '/fa/reqTpls',

    clientUrlRoot: '#fa/reqTpls',

    topicPrefix: 'fa.reqTpls',

    privilegePrefix: 'FA',

    nlsDomain: 'fa-reqTpls',

    labelAttribute: '_id',

    getLabel: function()
    {
      return t(this.nlsDomain, `type:${this.id}`);
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.type = this.getLabel();

      return obj;
    }

  });
});
