// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/time',
  'app/fa-common/templates/attachmentFormGroup'
], function(
  _,
  user,
  time,
  attachmentFormGroupTemplate
) {
  'use strict';

  function attachmentFormGroup(view, options)
  {
    var name = options.name || 'attachment';
    var property = name + 'File';
    var file = view.model.get(property);

    return view.renderPartialHtml(attachmentFormGroupTemplate, _.assign({
      url: view.model.url() + '/attachments/' + name,
      file: file,
      name: name,
      property: property,
      help: true,
      required: false,
      style: ''
    }, options));
  }

  function attachmentProp(view, options)
  {
    var name = options.name || 'attachment';

    return _.assign({
      id: '!' + name + 'File',
      value: function(file)
      {
        if (!file)
        {
          return view.t('FORM:edit:attachment:empty');
        }

        return '<a href="' + view.model.url() + '/attachments/' + name + '" target="_blank">'
          + _.escape(file.name)
          + '</a>';
      }
    }, options);
  }

  function committeeProp(view, options)
  {
    return _.assign({
      id: '!committee',
      value: function(users)
      {
        if (users.length === 0)
        {
          return '';
        }

        var html = '';
        var multi = users.length > 1;

        if (multi)
        {
          html += '<ul>';
        }

        var idProperty = user.idProperty;
        var committee = view.model.get('committee');
        var committeeAcceptance = view.model.get('committeeAcceptance');

        users.forEach(function(user, i)
        {
          if (multi)
          {
            html += '<li>';
          }

          html += user;

          if (!committeeAcceptance)
          {
            return;
          }

          var userAcceptance = committeeAcceptance[committee[i][idProperty]];
          var icon = '';
          var title = '';

          if (!userAcceptance || typeof userAcceptance.status !== 'boolean')
          {
            icon = 'fa-question';
            title = view.t('committee:acceptance:null');
          }
          else
          {
            if (userAcceptance.status)
            {
              icon = 'fa-thumbs-up';
            }
            else
            {
              icon = 'fa-thumbs-down';
            }

            title = [
              view.t('committee:acceptance:' + userAcceptance.status),
              time.format(userAcceptance.time, 'LLLL'),
              _.escape(userAcceptance.user.label)
            ].join('\n');
          }

          html += ' <i class="fa ' + icon + '" title="' + title + '"></i>';
        });

        if (multi)
        {
          html += '</ul>';
        }

        return html;
      }
    }, options);
  }

  function zplxProp(view, options)
  {
    return _.assign({
      id: '!zplx',
      value: function(zplxs)
      {
        return zplxList(view, zplxs, options && options.forceList);
      }
    }, options);
  }

  function zplxList(view, zplxs, force)
  {
    var items = zplxs.map(function(zplx)
    {
      var item = '<span class="text-fixed">ZPLX' + zplx.code + '</span>';

      if (zplx.value)
      {
        item += ' (' + zplx.value + ')';
      }

      if (zplx.auc)
      {
        item += ' [<span class="text-fixed">' + zplx.auc + '</span>]';
      }

      return item;
    });

    if (!force)
    {
      if (items.length === 0)
      {
        return '';
      }

      if (items.length === 1)
      {
        return items[0];
      }
    }

    return '<ul><li>' + items.join('<li>') + '</ul>';
  }

  return {
    extend: function(view)
    {
      var getTemplateHelpers = view.getTemplateHelpers;

      view.getTemplateHelpers = function()
      {
        return _.assign(getTemplateHelpers.apply(view, arguments), {
          fa: {
            attachmentFormGroup: attachmentFormGroup.bind(null, view),
            attachmentProp: attachmentProp.bind(null, view),
            committeeProp: committeeProp.bind(null, view),
            zplxProp: zplxProp.bind(null, view),
            zplxList: zplxList.bind(null, view)
          }
        });
      };

      return view;
    },
    attachmentFormGroup: attachmentFormGroup,
    attachmentProp: attachmentProp,
    committeeProp: committeeProp,
    zplxProp: zplxProp,
    zplxList: zplxList
  };
});
