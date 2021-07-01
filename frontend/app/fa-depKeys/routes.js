// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../fa-common/dictionaries',
  './DepKey'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  dictionaries,
  DepKey
) {
  'use strict';

  const nls = 'i18n!app/nls/fa-depKeys';
  const canView = user.auth('FA:MANAGE');
  const canManage = canView;

  router.map('/fa/depKeys', canView, () =>
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
            {id: '_id', className: 'is-min'},
            {id: 'name', className: 'is-min'},
            {id: 'years', className: 'is-min is-number'},
            {id: 'months', className: 'is-min is-number'},
            {id: 'active', className: 'is-min'},
            '-'
          ],
          collection: dictionaries.depKeys
        }));
      }
    );
  });

  router.map('/fa/depKeys/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/fa-depKeys/templates/details',
        nls
      ],
      (DetailsPage, detailsTemplate) =>
      {
        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          detailsTemplate,
          model: new DepKey({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/fa/depKeys;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/fa-depKeys/templates/form',
        nls
      ],
      (AddFormPage, formTemplate) =>
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          formTemplate,
          model: new DepKey()
        }));
      }
    );
  });

  router.map('/fa/depKeys/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/fa-depKeys/templates/form',
        nls
      ],
      (EditFormPage, formTemplate) =>
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          formTemplate,
          model: new DepKey({_id: req.params.id})
        }));
      }
    );
  });

  router.map(
    '/fa/depKeys/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/fa-depKeys/DepKey', _, _, {})
  );
});
