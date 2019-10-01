// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './FaLt'
], function(
  Collection,
  FaLt
) {
  'use strict';

  return Collection.extend({

    model: FaLt,

    rqlQuery: 'sort(-date)&limit(-1337)'

  });
});
