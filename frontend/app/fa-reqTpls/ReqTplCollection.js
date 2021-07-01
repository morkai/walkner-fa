// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './ReqTpl'
], function(
  Collection,
  ReqTpl
) {
  'use strict';

  return Collection.extend({

    model: ReqTpl,

    rqlQuery: 'sort(_id)',

    comparator: '_id'

  });
});
