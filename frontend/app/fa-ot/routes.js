// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/broker',
  'app/user',
  'app/router',
  'app/viewport',
  'app/core/util/showDeleteFormPage',
  'app/fa-common/dictionaries',
  './FaOt',
  './FaOtCollection',
  './pages/ListPage',
  './pages/DetailsPage',
  './pages/AddFormPage',
  './pages/EditFormPage',
  'i18n!app/nls/fa-common',
  'i18n!app/nls/fa-ot'
], function(
  _,
  broker,
  user,
  router,
  viewport,
  showDeleteFormPage,
  dictionaries,
  FaOt,
  FaOtCollection,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage
) {
  'use strict';

  var canView = user.auth('FA:VIEW', 'FA:OT:VIEW');
  var canAdd = user.auth('FA:MANAGE', 'FA:OT:MANAGE', 'FA:OT:protocol', 'FA:OT:document');
  var canEdit = user.auth(
    'FA:MANAGE',
    'FA:OT:MANAGE',
    'FA:OT:protocol',
    'FA:OT:authorize',
    'FA:OT:document',
    'FA:OT:verify',
    'FA:OT:accept',
    'FA:OT:record'
  );
  var canDelete = user.auth('FA:MANAGE', 'FA:OT:MANAGE');

  router.map('/fa/ot', canView, function(req)
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      collection: new FaOtCollection(null, {rqlQuery: req.rql})
    })));
  });

  router.map('/fa/ot/:id', canView, function(req)
  {
    viewport.showPage(dictionaries.bind(new DetailsPage({
      model: new FaOt({_id: req.params.id})
    })));
  });

  router.map('/fa/ot;add', canAdd, function()
  {
    viewport.showPage(new AddFormPage({
      model: new FaOt({
        protocolNeeded: true,
        commissioningType: 'new-asset',
        usageDestination: 'factory'
      })
    }));
  });

  router.map('/fa/ot/:id;edit', canEdit, function(req)
  {
    viewport.showPage(dictionaries.bind(new EditFormPage({
      model: new FaOt({
        _id: req.params.id
      })
    })));
  });

  router.map('/fa/ot/:id;delete', canDelete, showDeleteFormPage.bind(null, FaOt));
});
