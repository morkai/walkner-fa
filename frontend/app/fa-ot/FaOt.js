// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/fa-common/dictionaries',
  'app/fa-common/util/formatPeriod'
], function(
  _,
  t,
  time,
  user,
  Model,
  userInfoTemplate,
  dictionaries,
  formatPeriod
) {
  'use strict';

  const STAGE_TO_CLASS_NAME = {
    protocol: 'info',
    authorize: 'info',
    document: 'info',
    verify: 'info',
    accept: 'info',
    record: 'info',
    finished: '',
    cancelled: 'danger'
  };
  const VALUE_PROPS = [
    'value'
  ];
  const DATE_PROPS = [
    'protocolDate',
    'documentDate',
    'postingDate',
    'economicDate',
    'fiscalDate',
    'taxDate'
  ];

  return Model.extend({

    urlRoot: '/fa/ot',

    clientUrlRoot: '#fa/ot',

    topicPrefix: 'fa.ot',

    privilegePrefix: 'FA:OT',

    nlsDomain: 'fa-ot',

    labelAttribute: 'no',

    getLabel: function()
    {
      return this.get('documentNo') || this.get('protocolNo');
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.className = STAGE_TO_CLASS_NAME[obj.stage] || {};
      obj.url = this.url();
      obj.no = this.getLabel();
      obj.stage = t(this.nlsDomain, `stage:${obj.stage}`);
      obj.date = time.utc.format(obj.date, 'L');

      VALUE_PROPS.forEach(prop =>
      {
        obj[prop] = dictionaries.currencyFormatter.format(obj[prop] || 0);
      });

      return obj;
    },

    serializeRow: function()
    {
      const obj = this.serialize();

      obj.commissioningType = obj.commissioningType
        ? t(this.nlsDomain, `commissioningType:short:${obj.commissioningType}`)
        : '';

      if (obj.zplx.length > 1)
      {
        obj.zplx = obj.zplx[0].code + ' +' + (obj.zplx.length - 1);
      }
      else if (obj.zplx.length === 1)
      {
        obj.zplx = obj.zplx[0].code;
      }
      else
      {
        obj.zplx = '';
      }

      return obj;
    },

    serializeDetails: function()
    {
      const obj = this.serialize();
      const protocolNeeded = obj.protocolNeeded;

      DATE_PROPS.forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.utc.format(obj[prop], 'LL') : '';
      });

      obj.protocolNeeded = t(this.nlsDomain, `protocolNeeded:${protocolNeeded}`);
      obj.extendedDep = t(this.nlsDomain, `extendedDep:${obj.extendedDep}`);
      obj.commissioningType = obj.commissioningType
        ? t(this.nlsDomain, `commissioningType:${obj.commissioningType}`)
        : '';
      obj.usageDestination = t(this.nlsDomain, `usageDestination:${obj.usageDestination}`);
      obj.owner = userInfoTemplate(obj.owner);
      obj.depRate = obj.depRate.toLocaleString() + '%';

      obj.zplx = obj.zplx.map(zplx =>
      {
        return {
          code: zplx.code,
          value: !zplx.value ? '' : dictionaries.currencyFormatter.format(zplx.value),
          auc: zplx.auc
        };
      });

      obj.transactions = obj.transactions.map(t =>
      {
        return {
          type: t.type,
          amount1: dictionaries.currencyFormatter.format(t.amount1),
          amount2: dictionaries.currencyFormatter.format(t.amount2)
        };
      });

      const assetClass = dictionaries.assetClasses.get(obj.assetClass);

      if (assetClass)
      {
        obj.assetClass = assetClass.getLabel();
      }

      const costCenter = dictionaries.costCenters.get(obj.costCenter);

      if (costCenter)
      {
        obj.costCenter = costCenter.getLabel();
      }

      obj.economicPeriod = formatPeriod(obj.economicPeriod);
      obj.fiscalPeriod = formatPeriod(obj.fiscalPeriod);
      obj.taxPeriod = formatPeriod(obj.taxPeriod);

      obj.stages = {
        created: {
          who: userInfoTemplate(obj.createdBy),
          when: time.format(obj.createdAt, 'LLLL')
        },
        updated: {
          who: obj.updatedBy ? userInfoTemplate(obj.updatedBy) : null,
          when: obj.updatedAt ? time.format(obj.updatedAt, 'LLLL') : null
        }
      };

      Object.keys(obj.stageChangedBy).forEach((stage, i) =>
      {
        if (!protocolNeeded && i < 2)
        {
          return;
        }

        const who = obj.stageChangedBy[stage];
        const when = obj.stageChangedAt[stage];

        obj.stages[stage] = {
          who: who ? userInfoTemplate(who) : null,
          when: when ? time.format(when, 'LLLL') : null
        };
      });

      return obj;
    },

    serializeComments: function()
    {
      return this.get('changes').filter(function(c) { return !!c.comment; }).map(function(c)
      {
        return {
          time: time.format(c.date, 'L LT'),
          user: userInfoTemplate({userInfo: c.user, noIp: true}),
          text: c.comment
        };
      });
    },

    serializeForm: function()
    {
      const obj = this.toJSON();

      obj.no = this.getLabel();

      DATE_PROPS.forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.utc.format(obj[prop], 'YYYY-MM-DD') : '';
      });

      return obj;
    },

    canEdit: function()
    {
      return this.constructor.can.edit(this);
    },

    canCancel: function()
    {
      return this.constructor.can.cancel(this);
    },

    isUser: function()
    {
      return _.includes(this.get('users'), user.data._id);
    },

    isCreator: function()
    {
      return this.get('createdBy')._id === user.data._id;
    },

    isOwner: function()
    {
      var owner = this.get('owner');

      return !!owner && owner._id === user.data._id;
    }

  }, {

    can: {
      add: function()
      {
        return user.isAllowedTo('FA:MANAGE', 'FA:OT:MANAGE', 'FA:OT:ADD');
      },
      edit: function(model)
      {
        if (user.isAllowedTo('FA:MANAGE', 'FA:OT:MANAGE'))
        {
          return true;
        }

        var stage = model.get('stage');

        switch (stage)
        {
          case 'protocol':
          case 'authorize':
          case 'document':
            return model.isCreator();

          case 'accept':
            return model.isOwner();

          case 'verify':
          case 'record':
            return user.isAllowedTo('FA:OT:' + stage);

          case 'finished':
            return user.isAllowedTo('SUPER');

          case 'cancelled':
            return user.data.login === 'root';
        }

        return false;
      },
      cancel: function(model)
      {
        return model.isCreator() || user.isAllowedTo('FA:MANAGE', 'FA:OT:MANAGE');
      },
      delete: function()
      {
        return user.data.login === 'root';
      }
    },

    STATUSES: [
      'protocol',
      'document',
      'verify',
      'accept',
      'record',
      'finished',
      'cancelled'
    ]

  });
});
