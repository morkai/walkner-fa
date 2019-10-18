// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/fa-common/dictionaries'
], function(
  t,
  time,
  user,
  Model,
  userInfoTemplate,
  dictionaries
) {
  'use strict';

  var STAGE_TO_CLASS_NAME = {
    protocol: 'info',
    authorize: 'info',
    document: 'info',
    verify: 'info',
    accept: 'info',
    record: 'info',
    finished: '',
    cancelled: 'danger'
  };
  var VALUE_PROPS = [
    'value',
    'fiscalValue'
  ];

  function formatPeriod(months)
  {
    if (!months)
    {
      return '';
    }

    var y = Math.floor(months / 12);
    var m = months % 12;
    var key = 'period:';

    if (y && m)
    {
      key += 'both';
    }
    else if (y)
    {
      key += 'y';
    }
    else if (m)
    {
      key += 'm';
    }

    return t('fa-common', key, {
      years: y,
      months: m
    });
  }

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

    serializeRow: function()
    {
      var obj = this.toJSON();

      obj.className = STAGE_TO_CLASS_NAME[obj.stage] || {};
      obj.url = this.url();
      obj.no = this.getLabel();
      obj.stage = t(this.nlsDomain, 'stage:' + obj.stage);
      obj.date = time.utc.format(obj.date, 'L');

      VALUE_PROPS.forEach(function(prop)
      {
        obj[prop] = (obj[prop] || 0).toLocaleString('pl-PL', {
          style: 'currency',
          currency: 'PLN'
        });
      });

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serializeRow();
      var protocolNeeded = obj.protocolNeeded;

      obj.protocolDate = obj.protocolDate ? time.utc.format(obj.protocolDate, 'LL') : '';
      obj.documentDate = obj.documentDate ? time.utc.format(obj.documentDate, 'LL') : '';
      obj.protocolNeeded = t(this.nlsDomain, 'protocolNeeded:' + protocolNeeded);
      obj.commissioningType = obj.commissioningType
        ? t(this.nlsDomain, 'commissioningType:' + obj.commissioningType)
        : '';
      obj.usageDestination = t(this.nlsDomain, 'usageDestination:' + obj.usageDestination);
      obj.owner = userInfoTemplate({userInfo: obj.owner});
      obj.committee = obj.committee.map(function(userInfo) { return userInfoTemplate({userInfo: userInfo}); });
      obj.deprecationRate += '%';

      obj.zplx = obj.zplx.map(function(zplx)
      {
        return {
          code: zplx.code,
          value: !zplx.value ? '' : zplx.value.toLocaleString('pl-PL', {
            style: 'currency',
            currency: 'PLN'
          }),
          auc: zplx.auc
        };
      });

      var assetClass = dictionaries.assetClasses.get(obj.assetClass);

      if (assetClass)
      {
        obj.assetClass = assetClass.getLabel();
      }

      var costCenter = dictionaries.costCenters.get(obj.costCenter);

      if (costCenter)
      {
        obj.costCenter = costCenter.getLabel();
      }

      obj.economicPeriod = formatPeriod(obj.economicPeriod);
      obj.fiscalPeriod = formatPeriod(obj.fiscalPeriod);

      obj.stages = {
        created: {
          who: userInfoTemplate({userInfo: obj.createdBy}),
          when: time.format(obj.createdAt, 'LLLL')
        },
        updated: {
          who: obj.updatedBy ? userInfoTemplate({userInfo: obj.updatedBy}) : null,
          when: obj.updatedAt ? time.format(obj.updatedAt, 'LLLL') : null
        }
      };

      Object.keys(obj.stageChangedBy).forEach(function(stage, i)
      {
        if (!protocolNeeded && i < 2)
        {
          return;
        }

        var who = obj.stageChangedBy[stage];
        var when = obj.stageChangedAt[stage];

        obj.stages[stage] = {
          who: who ? userInfoTemplate({userInfo: who}) : null,
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
      var obj = this.toJSON();

      obj.no = this.getLabel();
      obj.protocolDate = obj.protocolDate ? time.utc.format(obj.protocolDate, 'YYYY-MM-DD') : '';
      obj.documentDate = obj.documentDate ? time.utc.format(obj.documentDate, 'YYYY-MM-DD') : '';

      return obj;
    },

    canEdit: function()
    {
      return this.constructor.can.edit(this);
    }

  }, {

    can: {
      add: function()
      {
        return user.isAllowedTo('FA:MANAGE', 'FA:OT:MANAGE', 'FA:OT:protocol', 'FA:OT:document');
      },
      edit: function(model)
      {
        var stage = model.get('stage');

        if (stage === 'cancelled')
        {
          return false;
        }

        if (stage === 'finished')
        {
          return user.isAllowedTo('SUPER');
        }

        return user.isAllowedTo('FA:MANAGE', 'FA:OT:MANAGE', 'FA:OT:' + model.get('stage'));
      },
      delete: function()
      {
        return user.data.login === 'root';
      }
    },

    STATUSES: [
      'protocol',
      'authorize',
      'document',
      'verify',
      'accept',
      'record',
      'finished',
      'cancelled'
    ]

  });
});
