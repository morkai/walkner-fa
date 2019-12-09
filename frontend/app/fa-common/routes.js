// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport'
], function(
  router,
  viewport
) {
  'use strict';

  router.map('/fa/help', function(req)
  {
    viewport.loadPage(
      [
        'app/fa-common/pages/HelpPage',
        'i18n!app/nls/fa-common'
      ],
      function(HelpPage)
      {
        return new HelpPage({
          tab: req.query.tab
        });
      }
    );
  });
});
