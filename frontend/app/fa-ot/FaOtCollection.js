// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './FaOt'
], function(
  Collection,
  FaOt
) {
  'use strict';

  return Collection.extend({

    model: FaOt,

    rqlQuery: 'exclude(changes)&sort(-date,-documentNo)&limit(-1337)',

    theadHeight: 2

  });
});
