// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/user',
  'app/viewport',
  'app/data/localStorage',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/fa-common/dictionaries',
  'app/fa-common/templates/changeItem',
  'app/fa-common/templates/changes',
  'i18n!app/nls/fa-common'
], function(
  _,
  $,
  time,
  user,
  viewport,
  localStorage,
  View,
  userInfoTemplate,
  dictionaries,
  itemTemplate,
  listTemplate
) {
  'use strict';

  var COMMENTS_ONLY_KEY = 'FA:CHANGES:COMMENTS_ONLY';

  return View.extend({

    template: listTemplate,

    events: {

      'submit form': function()
      {
        var view = this;
        var $comment = view.$id('comment');
        var comment = $comment.val().trim();

        if (comment === '')
        {
          return false;
        }

        var $submit = view.$id('submit').prop('disabled', true);

        var req = view.ajax({
          type: 'PUT',
          url: view.model.url(),
          data: JSON.stringify({comment: comment})
        });

        req.done(function()
        {
          $comment.val('');
        });

        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: view.t('fa-common', 'changes:failure')
          });
        });

        req.always(function()
        {
          $submit.prop('disabled', false);
        });

        return false;
      },
      'keyup #-comment': function(e)
      {
        if (e.key === 'Enter' && e.ctrlKey)
        {
          this.$id('submit').click();
        }
      },
      'click #-commentsOnly': function()
      {
        var oldValue = localStorage.getItem(COMMENTS_ONLY_KEY);
        var newValue = oldValue == null || oldValue === '0' ? '1' : '0';

        localStorage.setItem(COMMENTS_ONLY_KEY, newValue);

        this.render();
      },
      'mouseenter #-items': function()
      {
        this.$id('items').focus();
      }

    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:changes', this.updateChanges);
      });
    },

    getTemplateData: function()
    {
      var view = this;

      return {
        style: view.oldStyle,
        createdItem: !view.t.has('changes:created') ? null : this.serializeItem({
          date: view.model.get('createdAt'),
          user: view.model.get('createdBy'),
          data: {},
          comment: function() { return view.t('changes:created'); }
        }, -1, true),
        items: view.serializeItems(localStorage.getItem(COMMENTS_ONLY_KEY) === '1'),
        renderItem: view.renderPartialHtml.bind(view, itemTemplate)
      };
    },

    serializeItems: function(commentsOnly)
    {
      var view = this;

      return view.model.get('changes')
        .map(function(change, i) { return view.serializeItem(change, i, commentsOnly); })
        .filter(function(change) { return !commentsOnly || change.comment.length > 0; });
    },

    serializeItem: function(change, changeIndex, commentsOnly)
    {
      var view = this;
      var changes = commentsOnly ? [] : _.map(change.data, function(values, property)
      {
        return {
          label: view.t('PROPERTY:' + property),
          oldValue: view.serializeItemValue(property, values[0], true, changeIndex),
          newValue: view.serializeItemValue(property, values[1], false, changeIndex)
        };
      });
      var comment = typeof change.comment === 'function'
        ? change.comment()
        : _.escape(change.comment.trim());

      return {
        time: time.toTagData(change.date),
        user: userInfoTemplate({userInfo: change.user}),
        changes: changes,
        comment: comment
      };
    },

    serializeItemValue: function(property, value, old, changeIndex)
    {
      if (value == null || value.length === 0)
      {
        return '-';
      }

      if (/date$/i.test(property))
      {
        return time.format(value, 'LL');
      }

      if (/File$/.test(property))
      {
        var file = property.replace(/File$/, '');
        var href = this.model.url() + '/attachments/' + file + '?change=' + changeIndex + '&old=' + (old ? 1 : 0);

        return '<a href="' + href + '" target="_blank">' + _.escape(value.name) + '</a>';
      }

      if (/value$/i.test(property))
      {
        return value === 0 ? '-' : value.toLocaleString(undefined, {
          style: 'currency',
          currency: 'PLN'
        });
      }

      switch (property)
      {
        case 'owner':
        case 'applicant':
          return userInfoTemplate({userInfo: value});

        case 'committee': // TODO wrap?
          return value.map(function(userInfo) { return userInfoTemplate({userInfo: userInfo}); }).join(', ');

        case 'zplx':
          return value.join(', ');

        case 'stage':
          return this.t('stage:' + value);

        case 'destination':
        case 'usageDestination':
        case 'costCenter':
        {
          var model = dictionaries.forProperty(property).get(value);

          return model ? _.escape(model.getLabel()) : value;
        }

        default:
          return String(value).length <= 43 ? _.escape(value) : {
            more: value,
            toString: function() { return _.escape(value.substr(0, 40)) + '...'; }
          };
      }
    },

    beforeRender: function()
    {
      this.oldStyle = this.el.getAttribute('style') || '';
    },

    afterRender: function()
    {
      this.lastChangeCount = this.model.get('changes').length;

      this.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        template: this.$el.popover.Constructor.DEFAULTS.template.replace(
          'class="popover"',
          'class="popover fa-changes-popover"'
        ),
        title: function()
        {
          return $(this).closest('tr').children().first().text();
        }
      });

      if (!this.timers.updateTimes)
      {
        this.timers.updateTimes = setInterval(this.updateTimes.bind(this), 30000);
      }

      this.toggleCommentsOnly();
      this.scrollToBottom();
    },

    updateChanges: function()
    {
      var commentsOnly = localStorage.getItem(COMMENTS_ONLY_KEY) === '1';
      var changes = this.model.get('changes');
      var html = '';

      for (var i = this.lastChangeCount; i < changes.length; ++i)
      {
        var item = this.serializeItem(changes[i], i, commentsOnly);

        if (commentsOnly && item.comment.length === 0)
        {
          continue;
        }

        html += this.renderPartialHtml(itemTemplate, {
          item: item
        });
      }

      if (html.length)
      {
        $(html).appendTo(this.$id('items')).addClass('highlight');

        this.scrollToBottom();
      }

      this.lastChangeCount = changes.length;
    },

    updateTimes: function()
    {
      this.$('.fa-changes-time').each(function()
      {
        var tagData = time.toTagData(this.getAttribute('datetime'));

        this.textContent = tagData.daysAgo > 5 ? tagData.long : tagData.human;
      });
    },

    toggleCommentsOnly: function()
    {
      this.$id('commentsOnly').toggleClass('active', localStorage.getItem(COMMENTS_ONLY_KEY) === '1');
    },

    scrollToBottom: function()
    {
      var itemsEl = this.$id('items')[0];

      itemsEl.scrollTop = itemsEl.scrollHeight;
    }

  });
});
