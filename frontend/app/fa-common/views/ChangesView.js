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

        req.done(function(res)
        {
          view.model.set('changes', res.changes);

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
      var changes = view.model.get('changes') || [];
      var firstComment = changes.length && changes[0].date === view.model.get('createdAt');
      var createdItem = null;

      if (view.model.id && view.t.has('changes:created') && !firstComment)
      {
        createdItem = this.serializeItem({
          date: view.model.get('createdAt'),
          user: view.model.get('createdBy'),
          data: {},
          comment: function() { return view.t('changes:created'); }
        }, -1, true);
      }

      return {
        style: view.oldStyle,
        createdItem: createdItem,
        items: view.serializeItems(localStorage.getItem(COMMENTS_ONLY_KEY) === '1'),
        renderItem: view.renderPartialHtml.bind(view, itemTemplate)
      };
    },

    serializeItems(commentsOnly)
    {
      return (this.model.get('changes') || [])
        .map((change, i) => this.serializeItem(change, i, commentsOnly))
        .filter(change => !commentsOnly || change.comment.length > 0);
    },

    serializeItem(change, changeIndex, commentsOnly)
    {
      const changes = [];

      if (!commentsOnly)
      {
        _.forEach(change.data, (values, property) =>
        {
          if (property === 'assets' && !Array.isArray(values))
          {
            return this.serializeAssetsItems(changes, change, changeIndex, values);
          }

          changes.push({
            label: this.t(`PROPERTY:${property}`),
            oldValue: this.serializeItemValue(property, values[0], true, changeIndex),
            newValue: this.serializeItemValue(property, values[1], false, changeIndex)
          });
        });
      }

      const comment = typeof change.comment === 'function'
        ? change.comment()
        : _.escape(change.comment.trim());

      return {
        time: time.toTagData(change.date),
        user: userInfoTemplate({userInfo: change.user}),
        changes,
        comment
      };
    },

    serializeAssetsItems(changes, change, changeIndex, {added, edited, deleted})
    {
      (added || []).forEach(newAsset =>
      {
        changes.push({
          label: this.t('PROPERTY:assets') + ` (#${newAsset._i + 1})`,
          oldValue: '-',
          newValue: this.serializeItemValue('assetName', newAsset.assetName || newAsset._id, false, changeIndex)
        });
      });

      (deleted || []).forEach(oldAsset =>
      {
        changes.push({
          label: this.t('PROPERTY:assets') + ` (#${oldAsset._i + 1})`,
          oldValue: this.serializeItemValue('assetName', oldAsset.assetName || oldAsset._id, false, changeIndex),
          newValue: '-'
        });
      });

      (edited || []).forEach(asset =>
      {
        _.without(Object.keys(asset), '_i', '_id', 'old').forEach(prop =>
        {
          changes.push({
            label: this.t(`PROPERTY:${prop}`) + ` (#${asset._i + 1})`,
            oldValue: this.serializeItemValue(prop, asset.old[prop], true, changeIndex),
            newValue: this.serializeItemValue(prop, asset[prop], false, changeIndex)
          });
        });
      });
    },

    serializeItemValue: function(property, value, old, changeIndex)
    {
      if ((value == null || value.length === 0) && property !== 'committeeAcceptance')
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
        return value === 0 ? '-' : dictionaries.currencyFormatter.format(value);
      }

      var overflow = '';

      if (this.overflowProperties[property])
      {
        var values = this.overflowProperties[property].apply(this, arguments);

        overflow = values[0];
        value = values[1];
      }

      switch (property)
      {
        case 'owner':
        case 'applicant':
          return userInfoTemplate({userInfo: value});

        case 'stage':
          return this.t('stage:' + value, {kind: this.model.get('kind') || ''});

        case 'assetClass':
        case 'costCenter':
        {
          var model = dictionaries.forProperty(property).get(value);

          return model ? _.escape(model.getLabel()) : value;
        }

        default:
          if (overflow === null && value === null)
          {
            return null;
          }

          if (overflow)
          {
            return '<span class="fa-changes-overflow has-more" data-content="' + _.escape(overflow) + '">' + value + '</span>';
          }

          if (typeof value === 'number')
          {
            return value.toLocaleString();
          }

          value = String(value);

          return value.length <= 43 ? _.escape(value) : {
            more: value,
            toString: function() { return _.escape(value.substr(0, 40)) + '...'; }
          };
      }
    },

    overflowProperties: {
      zplx: function(property, value)
      {
        value = value
          .map(zplx =>
          {
            let str = `<span class="text-fixed">${zplx.code}</span>`;

            if (zplx.value)
            {
              str += ' (' + dictionaries.currencyFormatter.format(zplx.value) + ')';
            }

            if (zplx.auc)
            {
              str += ` [<span class="text-fixed">${zplx.auc}</span>]`;
            }

            return str;
          }).join('; ');

        return [value.replace(/; /g, '\n'), value];
      },
      transactions: function(property, value)
      {
        value = value
          .map(t =>
          {
            const amount1 = dictionaries.currencyFormatter.format(t.amount1);
            const amount2 = dictionaries.currencyFormatter.format(t.amount2);

            return `<span class="text-fixed">${t.type}</span> / ${amount1} / ${amount2}`;
          }).join('; ');

        return [value.replace(/; /g, '\n'), value];
      },
      assets: function(property, value)
      {
        value = value
          .map(a =>
          {
            return `<span class="text-fixed">${a.no}</span>`
              + ` / <span class="text-fixed">${a.transactionType}</span>`
              + ` / <span class="text-fixed">${a.accountingNo || '?'}</span>`;
          }).join('; ');

        return [value.replace(/; /g, '\n'), value];
      },
      committee: function(property, value)
      {
        return [
          value.map(function(userInfo) { return userInfo.label; }).join('\n'),
          value.map(function(userInfo) { return userInfoTemplate({userInfo: userInfo}); }).join(', ')
        ];
      },
      committeeAcceptance: function(property, newValue, old, changeIndex)
      {
        if (old)
        {
          return [null, null];
        }

        if (_.isEmpty(newValue) || _.every(newValue, function(a) { return a.status === null; }))
        {
          return [null, null];
        }

        var oldValue = this.model.get('changes')[changeIndex].data.committeeAcceptance[0];
        var changed = [];

        _.forEach(newValue, function(newAcceptance, userId)
        {
          var oldAcceptance = oldValue[userId] || {status: null};

          if (newAcceptance.status !== oldAcceptance.status)
          {
            changed.push(newAcceptance);
          }
        });

        if (!changed.length)
        {
          return [null, null];
        }

        return [
          changed
            .map(function(acceptance)
            {
              return acceptance.user.label
                + ' ' + (acceptance.status ? '👍' : '👎');
            })
            .join('\n'),
          changed
            .map(function(acceptance)
            {
              return userInfoTemplate({userInfo: acceptance.user, noIp: true})
                + ' <i class="fa fa-thumbs-' + (acceptance.status ? 'up' : 'down') + '"></i>';
            })
            .join(', ')
        ];
      }
    },

    beforeRender: function()
    {
      this.oldStyle = this.el.getAttribute('style') || '';
    },

    afterRender: function()
    {
      this.lastChangeCount = (this.model.get('changes') || []).length;

      this.$el.popover({
        container: 'body',
        selector: '.has-more',
        placement: 'top',
        trigger: 'hover',
        className: 'fa-changes-popover',
        html: 1,
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

      if (!this.model.id)
      {
        this.$('input, textarea, button').prop('disabled', true);
      }
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
