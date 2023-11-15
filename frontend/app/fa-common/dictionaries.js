// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../users/UserCollection',
  '../fa-assetGroups/AssetGroupCollection',
  '../fa-assetClasses/AssetClassCollection',
  '../fa-costCenters/CostCenterCollection',
  '../fa-depKeys/DepKeyCollection'
], function(
  _,
  $,
  broker,
  pubsub,
  user,
  UserCollection,
  AssetGroupCollection,
  AssetClassCollection,
  CostCenterCollection,
  DepKeyCollection
) {
  'use strict';

  var TOPIC_PREFIX = 'fa.';
  var PROP_TO_DICT = {
    assetGroup: 'assetGroups',
    assetClass: 'assetClasses',
    depKey: 'depKeys',
    costCenter: 'costCenters'
  };

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var dictionaries = {
    economicMethods: [
      '0000 - No depreciation',
      'ZPH9 - Philips straight line to 0 (IFRS)'
    ],
    assetGroups: new AssetGroupCollection(),
    assetClasses: new AssetClassCollection(),
    depKeys: new DepKeyCollection(),
    costCenters: new CostCenterCollection(),
    committee: new UserCollection(null, {
      rqlQuery: 'select(firstName,lastName,login,privileges)&sort(searchName)&limit(0)'
        + '&privileges=' + encodeURIComponent('FA:LT:committee')
    }),
    currencyFormatter: new Intl.NumberFormat('pl', {
      style: 'currency',
      currency: 'PLN'
    }),
    loaded: false,
    load: function()
    {
      if (releaseTimer !== null)
      {
        clearTimeout(releaseTimer);
        releaseTimer = null;
      }

      if (dictionaries.loaded)
      {
        return null;
      }

      if (req !== null)
      {
        return req;
      }

      req = $.ajax({
        url: '/fa/dictionaries'
      });

      req.done(function(res)
      {
        dictionaries.loaded = true;

        resetDictionaries(res);
      });

      req.fail(unload);

      req.always(function() { req = null; });

      pubsubSandbox = pubsub.sandbox();

      Object.keys(PROP_TO_DICT).forEach(function(prop)
      {
        pubsubSandbox.subscribe(TOPIC_PREFIX + PROP_TO_DICT[prop] + '.**', handleDictionaryMessage);
      });

      pubsubSandbox.subscribe('users.edited', handleUserEdited);

      return req;
    },
    unload: function()
    {
      if (releaseTimer !== null)
      {
        clearTimeout(releaseTimer);
      }

      releaseTimer = setTimeout(unload, 30000);
    },
    getLabel: function(dictionary, id)
    {
      if (typeof dictionary === 'string')
      {
        dictionary = this.forProperty(dictionary) || dictionaries[dictionary];
      }

      if (!dictionary || Array.isArray(dictionary))
      {
        return id;
      }

      var model = dictionary.get(id);

      if (!model)
      {
        return id;
      }

      return model.getLabel();
    },
    forProperty: function(prop)
    {
      return this[PROP_TO_DICT[prop]] || null;
    },
    bind: function(page)
    {
      var dictionaries = this;

      page.on('beforeLoad', function(page, requests)
      {
        requests.push(dictionaries.load());
      });

      page.on('afterRender', dictionaries.load.bind(dictionaries));

      page.once('remove', dictionaries.unload.bind(dictionaries));

      return page;
    }
  };

  function resetDictionaries(data)
  {
    Object.keys(PROP_TO_DICT).forEach(function(prop)
    {
      var dict = PROP_TO_DICT[prop];

      dictionaries[dict].reset(data ? data[dict] : []);
    });

    dictionaries.committee.reset(data ? data.committee : []);
  }

  function unload()
  {
    releaseTimer = null;

    if (pubsubSandbox !== null)
    {
      pubsubSandbox.destroy();
      pubsubSandbox = null;
    }

    dictionaries.loaded = false;

    resetDictionaries();
  }

  function handleDictionaryMessage(message, topic)
  {
    var topicParts = topic.split('.');
    var collection = dictionaries[topicParts[1]];

    if (!collection)
    {
      return;
    }

    switch (topicParts[2])
    {
      case 'added':
        collection.add(message.model);
        break;

      case 'edited':
      {
        var editedModel = collection.get(message.model._id);

        if (editedModel)
        {
          editedModel.set(message.model);
        }
        break;
      }

      case 'deleted':
        collection.remove(collection.get(message.model._id));
        break;
    }

    broker.publish(topic, message);
  }

  function handleUserEdited(message)
  {
    var newUser = message.model;
    var oldUser = dictionaries.committee.get(newUser._id);

    if (_.includes(newUser.privileges, 'FA:LT:committee'))
    {
      if (!oldUser)
      {
        dictionaries.committee.add(newUser);
      }
    }
    else if (oldUser)
    {
      dictionaries.committee.remove(oldUser);
    }
  }

  return dictionaries;
});
