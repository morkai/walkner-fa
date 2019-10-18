// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../fa-common/dictionaries',
  './AssetClass'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  dictionaries,
  AssetClass
) {
  'use strict';

  var nls = 'i18n!app/nls/fa-assetClasses';
  var canView = user.auth('FA:MANAGE');
  var canManage = canView;

  router.map('/fa/assetClasses', canView, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        nls
      ],
      function(ListPage)
      {
        return dictionaries.bind(new ListPage({
          pageClassName: 'page-max-flex',
          columns: [
            {id: 'name', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            '-'
          ],
          collection: dictionaries.assetClasses
        }));
      }
    );
  });

  router.map('/fa/assetClasses/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/fa-assetClasses/templates/details',
        nls
      ],
      function(DetailsPage, detailsTemplate)
      {
        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          detailsTemplate: detailsTemplate,
          model: new AssetClass({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/fa/assetClasses;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/fa-assetClasses/templates/form',
        nls
      ],
      function(AddFormPage, formTemplate)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          formTemplate: formTemplate,
          model: new AssetClass()
        }));
      }
    );
  });

  router.map('/fa/assetClasses/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/fa-assetClasses/templates/form',
        nls
      ],
      function(EditFormPage, formTemplate)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          formTemplate: formTemplate,
          model: new AssetClass({_id: req.params.id})
        }));
      }
    );
  });

  router.map(
    '/fa/assetClasses/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/fa-assetClasses/AssetClass', _, _, {})
  );
});
