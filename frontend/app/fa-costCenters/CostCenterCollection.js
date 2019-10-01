// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './CostCenter'
], function(
  Collection,
  CostCenter
) {
  'use strict';

  return Collection.extend({

    model: CostCenter,

    rqlQuery: 'sort(name)',

    comparator: 'name'

  });
});
