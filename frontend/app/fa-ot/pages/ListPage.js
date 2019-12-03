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
          pattern: '^([pP]?[oO][tT]\/)?[0-9]{1,5}\/[0-9]{4}$',
          prepareValue: function(value)
          {
            value = value.trim().toUpperCase();

            if (!/OT/.test(value))
            {
              value = 'OT/' + value;
            }

            return value;
          }
        }),
        pageActions.export(layout, page, page.collection, false),
        pageActions.add(page.collection)
      ];
    }

  });
});
