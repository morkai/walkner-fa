// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/FilterView',
  '../views/ListView'
], function(
  FilteredListPage,
  pageActions,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    actions: function(layout)
    {
      var page = this;

      return [
        pageActions.jump(page, page.collection, {
          pattern: '^(LT\/)?[0-9]{1,4}\/[0-9]{1,2}/[0-9]{4}$',
          prepareValue: function(value)
          {
            return value.trim().replace('LT/', '');
          }
        }),
        pageActions.export(layout, page, page.collection, false),
        pageActions.add(page.collection)
      ];
    }

  });
});
