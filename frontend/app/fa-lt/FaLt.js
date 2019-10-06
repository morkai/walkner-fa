// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  t,
  time,
  user,
  Model,
  userInfoTemplate
) {
  'use strict';

  var VALUE_PROPS = [
    'initialValue',
    'deprecationValue',
    'netValue',
    'economicDeprecationValue',
    'economicNetValue',
    'saleValue'
  ];

  return Model.extend({

    urlRoot: '/fa/lt',

    clientUrlRoot: '#fa/lt',

    topicPrefix: 'fa.lt',

    privilegePrefix: 'FA:LT',

    nlsDomain: 'fa-lt',

    labelAttribute: 'no',

    getLabel: function()
    {
      return 'LT/' + this.get('no');
    },

    serializeRow: function()
    {
      var obj = this.toJSON();

      obj.no = this.getLabel();
      obj.kind = t(this.nlsDomain, 'kind:short:' + obj.kind);
      obj.stage = t(this.nlsDomain, 'stage:' + obj.stage);
      obj.date = time.utc.format(obj.date, 'LL');

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

      obj.kind = t(this.nlsDomain, 'kind:' + this.get('kind'));
      obj.mergeType = obj.mergeType ? t(this.nlsDomain, 'mergeType:' + obj.mergeType) : '';
      obj.applicant = userInfoTemplate({userInfo: obj.applicant});

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

      Object.keys(obj.stageChangedBy).forEach(function(stage)
      {
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
      obj.date = obj.date ? time.utc.format(obj.date, 'YYYY-MM-DD') : '';

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
        return user.isAllowedTo('FA:MANAGE', 'FA:LT:MANAGE', 'FA:LT:protocol');
      },
      edit: function(model)
      {
        var stage = model.get('stage');

        if (stage === 'finished')
        {
          return user.data.login === 'root';
        }

        return user.isAllowedTo('FA:MANAGE', 'FA:LT:MANAGE', 'FA:LT:' + model.get('stage'));
      },
      delete: function()
      {
        return user.data.login === 'root';
      }
    },

    STATUSES: [
      'protocol',
      'verify',
      'acceptOwner',
      'acceptDepartment',
      'acceptFinance',
      'record',
      'finished'
    ],

    KINDS: [
      'scrap',
      'merge',
      'sale',
      'other'
    ],

    MERGE_TYPES: [
      'full',
      'partial'
    ]

  });
});
