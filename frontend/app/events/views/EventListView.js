// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/core/views/ListView',
  'app/events/templates/list',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  ListView,
  listTemplate,
  userInfoTemplate
) {
  'use strict';

  return ListView.extend({

    template: listTemplate,

    remoteTopics: {
      'events.saved': 'refreshCollection'
    },

    serialize: function()
    {
      var view = this;

      return {
        events: this.collection.map(function(event)
        {
          var type = event.get('type');
          var data = view.prepareData(type, event.get('data'));
          var user = event.get('user');
          var userInfo = null;

          if (user)
          {
            userInfo = {
              id: user._id,
              label: user.name,
              ip: user.ipAddress
            };
          }

          return {
            severity: event.getSeverityClassName(),
            time: time.format(event.get('time'), 'L, LTS'),
            user: userInfoTemplate({userInfo: userInfo}),
            type: t('events', 'TYPE:' + type),
            text: t('events', 'TEXT:' + type, t.flatten(data))
          };
        })
      };
    },

    refreshCollection: function(events, force)
    {
      if (typeof this.options.filter === 'function'
        && Array.isArray(events)
        && !events.some(this.options.filter))
      {
        return;
      }

      return ListView.prototype.refreshCollection.call(this, events, force);
    },

    prepareData: function(type, data)
    {
      if (data.$prepared)
      {
        return data;
      }

      data.$prepared = true;

      if (data.date)
      {
        data.dateUtc = time.utc.format(data.date, 'L');
        data.date = time.format(data.date, 'L');
      }

      if (data.timestamp)
      {
        data.timestamp = time.format(data.timestamp, 'L, LTS');
      }

      switch (type) // eslint-disable-line no-empty
      {

      }

      return data;
    }

  });
});
