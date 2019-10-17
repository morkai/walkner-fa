// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/fa-common/templates/attachmentFormGroup'
], function(
  _,
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

        if (users.length === 1)
        {
          return users[0];
        }

        return '<ul><li>' + users.join('<li>') + '</ul>';
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
