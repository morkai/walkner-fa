// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './ReqTpl',
  './ReqTplCollection'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  ReqTpl,
  ReqTplCollection
) {
  'use strict';

  var nls = 'i18n!app/nls/fa-reqTpls';
  var canView = user.auth('FA:MANAGE');
  var canManage = canView;

  router.map('/fa/reqTpls', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        nls
      ],
      function(ListPage)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          columns: [
            {id: '_id', className: 'is-min', valueProperty: 'type'},
            {id: 'worksheet'}
          ],
          collection: new ReqTplCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/fa/reqTpls/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/fa-reqTpls/templates/details',
        nls
      ],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          detailsTemplate,
          model: new ReqTpl({_id: req.params.id})
        });
      }
    );
  });

  router.map('/fa/reqTpls;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/fa-reqTpls/views/FormView',
        nls
      ],
      function(AddFormPage, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          FormView,
          model: new ReqTpl()
        });
      }
    );
  });

  router.map('/fa/reqTpls/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/fa-reqTpls/views/FormView',
        nls
      ],
      function(EditFormPage, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          FormView,
          model: new ReqTpl({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/fa/reqTpls/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/fa-reqTpls/ReqTpl', _, _, {})
  );
});
