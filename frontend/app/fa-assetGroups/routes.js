// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../fa-common/dictionaries',
  './AssetGroup'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  dictionaries,
  AssetGroup
) {
  'use strict';

  const nls = 'i18n!app/nls/fa-assetGroups';
  const canView = user.auth('FA:MANAGE');
  const canManage = canView;

  router.map('/fa/assetGroups', canView, () =>
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        nls
      ],
      (ListPage) =>
      {
        return dictionaries.bind(new ListPage({
          pageClassName: 'page-max-flex',
          columns: [
            {id: 'evalGroup1', className: 'is-overflow w300'},
            {id: 'evalGroup5', className: 'is-overflow w300'},
            {id: 'depRate', className: 'is-min is-number'},
            {id: 'depKey', className: 'is-min'},
            {id: 'assetClass', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            '-'
          ],
          collection: dictionaries.assetGroups
        }));
      }
    );
  });

  router.map('/fa/assetGroups/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/fa-assetGroups/templates/details',
        nls
      ],
      (DetailsPage, detailsTemplate) =>
      {
        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          detailsTemplate,
          model: new AssetGroup({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/fa/assetGroups;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/fa-assetGroups/templates/form',
        nls
      ],
      (AddFormPage, formTemplate) =>
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          formTemplate,
          model: new AssetGroup()
        }));
      }
    );
  });

  router.map('/fa/assetGroups/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/fa-assetGroups/templates/form',
        nls
      ],
      (EditFormPage, formTemplate) =>
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          formTemplate,
          model: new AssetGroup({_id: req.params.id})
        }));
      }
    );
  });

  router.map(
    '/fa/assetGroups/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/fa-assetGroups/AssetGroup', _, _, {})
  );
});
