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
    if (options.visible === false)
    {
      return '';
    }

    var name = options.name || 'attachment';
    var property = name + 'File';
    var file = view.model.get(property);
    var accept = [].concat(options.accept || '*.*').map(function(type)
      {
        if (type === 'doc')
        {
          return '.docx,.xlsx,.pdf';
        }

        if (type === 'img')
        {
          return '.jpg,.jpeg,.png,.webp';
        }

        return type;
      }).join(',');

    return view.renderPartialHtml(attachmentFormGroupTemplate, _.assign({
      editable: true,
      url: view.model.url() + '/attachments/' + name,
      file: file,
      name: name,
      property: property,
      required: false,
      style: ''
    }, options, {
      accept: accept
    }));
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

  function transactionsProp(view, options)
  {
    return _.assign({
      id: '!transactions',
      value: transactions => transactionsList(view, transactions, options && options.forceList)
    }, options);
  }

  function transactionsList(view, transactions, force)
  {
    const rows = transactions.map(t =>
    {
      return `
<tr>
  <td class="is-min text-fixed">${t.type}
  <td class="is-min text-right">${t.amount1}
  <td class="is-min text-right">${t.amount2}
`;
    });

    if (!force && rows.length === 0)
    {
      return '';
    }

    return `
<table class="table table-condensed table-bordered" style="width: auto">
<thead>
<tr>
<th class="is-min">${view.t('PROPERTY:transactions.type')}
<th class="is-min">${view.t('PROPERTY:transactions.amount1')}
<th class="is-min">${view.t('PROPERTY:transactions.amount2')}
<tbody>
${rows.join('')}
</table>`;
  }

  function assetsProp(view, options)
  {
    return _.assign({
      id: '!assets',
      value: assets => assetsList(view, assets, options && options.forceList)
    }, options);
  }

  function assetsList(view, assets, force)
  {
    const rows = assets.map(a =>
    {
      return `
<tr>
  <td class="is-min text-fixed">${a.no}
  <td class="is-min text-fixed">${a.transactionType}
`;
    });

    if (!force && rows.length === 0)
    {
      return '';
    }

    return `
<table class="table table-condensed table-bordered" style="width: auto">
<thead>
<tr>
<th class="is-min">${view.t('PROPERTY:assets.no')}
<th class="is-min">${view.t('PROPERTY:assets.transactionType')}
<tbody>
${rows.join('')}
</table>`;
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
            zplxList: zplxList.bind(null, view),
            transactionsProp: transactionsProp.bind(null, view),
            transactionsList: transactionsList.bind(null, view),
            assetsProp: assetsProp.bind(null, view),
            assetsList: assetsList.bind(null, view)
          }
        });
      };

      return view;
    },
    attachmentFormGroup,
    attachmentProp,
    committeeProp,
    zplxProp,
    zplxList,
    transactionsProp,
    transactionsList,
    assetsProp,
    assetsList
  };
});
