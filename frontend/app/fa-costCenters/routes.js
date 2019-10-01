// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../fa-common/dictionaries',
  './CostCenter'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  dictionaries,
  CostCenter
) {
  'use strict';

  var nls = 'i18n!app/nls/fa-costCenters';
  var canView = user.auth('FA:MANAGE');
  var canManage = canView;

  router.map('/fa/costCenters', canView, function()
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
            {id: '_id', className: 'is-min'},
            {id: 'description', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            '-'
          ],
          collection: dictionaries.costCenters
        }));
      }
    );
  });

  router.map('/fa/costCenters/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/fa-costCenters/templates/details',
        nls
      ],
      function(DetailsPage, detailsTemplate)
      {
        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          detailsTemplate: detailsTemplate,
          model: new CostCenter({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/fa/costCenters;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/fa-costCenters/templates/form',
        nls
      ],
      function(AddFormPage, formTemplate)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          formTemplate: formTemplate,
          model: new CostCenter()
        }));
      }
    );
  });

  router.map('/fa/costCenters/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/fa-costCenters/templates/form',
        nls
      ],
      function(EditFormPage, formTemplate)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          FormView: formTemplate,
          model: new CostCenter({_id: req.params.id})
        }));
      }
    );
  });

  router.map(
    '/fa/costCenters/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/fa-costCenters/CostCenter', _, _, {})
  );
});
