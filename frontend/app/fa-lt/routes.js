// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/broker',
  'app/user',
  'app/router',
  'app/viewport',
  'app/core/util/showDeleteFormPage',
  'app/fa-common/dictionaries',
  './FaLt',
  './FaLtCollection',
  './pages/ListPage',
  './pages/DetailsPage',
  './pages/AddFormPage',
  './pages/EditFormPage',
  'i18n!app/nls/fa-common',
  'i18n!app/nls/fa-lt'
], function(
  _,
  broker,
  user,
  router,
  viewport,
  showDeleteFormPage,
  dictionaries,
  FaLt,
  FaLtCollection,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage
) {
  'use strict';

  var canView = user.auth('FA:VIEW', 'FA:LT:VIEW');
  var canAdd = user.auth('FA:MANAGE', 'FA:LT:MANAGE', 'FA:LT:ADD');
  var canEdit = user.auth('FA:LT:MANAGE', 'FA:LT:*', 'FA:VIEW', 'FA:LT:VIEW');
  var canDelete = user.auth('FA:MANAGE', 'FA:LT:MANAGE');

  router.map('/fa/lt', canView, function(req)
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      collection: new FaLtCollection(null, {rqlQuery: req.rql})
    })));
  });

  router.map('/fa/lt/:id', canView, function(req)
  {
    viewport.showPage(dictionaries.bind(new DetailsPage({
      model: new FaLt({_id: req.params.id})
    })));
  });

  router.map('/fa/lt;add', canAdd, function()
  {
    viewport.showPage(new AddFormPage({
      model: new FaLt({
        kind: 'scrap',
        mergeType: 'full'
      })
    }));
  });

  router.map('/fa/lt/:id;edit', canEdit, function(req)
  {
    viewport.showPage(dictionaries.bind(new EditFormPage({
      model: new FaLt({_id: req.params.id})
    })));
  });

  router.map('/fa/lt/:id;delete', canDelete, showDeleteFormPage.bind(null, FaLt));
});
