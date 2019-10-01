// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/pageActions',
  '../views/DataTableView'
], function(
  View,
  pageActions,
  DataTableView
) {
  'use strict';

  return View.extend({

    breadcrumbs: function()
    {
      return [this.t('BREADCRUMBS:browse')];
    },

    actions: function(layout)
    {
      var page = this;

      return [
        pageActions.jump(page, page.collection, {
          pattern: '^(OT\/)?[0-9]{1,4}\/[0-9]{1,2}/[0-9]{4}$',
          prepareValue: function(value)
          {
            return value.trim().replace('OT/', '');
          }
        }),
        pageActions.export(layout, page, page.collection, false),
        pageActions.add(page.collection)
      ];
    },

    initialize: function()
    {
      this.view = new DataTableView({
        collection: this.collection
      });
    }

  });
});
