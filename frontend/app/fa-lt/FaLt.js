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
    'economicInitialValue',
    'economicDeprecationValue',
    'economicNetValue',
    'saleValue'
  ];
  var STAGE_TO_CLASS_NAME = {
    protocol: 'info',
    verify: 'info',
    acceptOwner: 'info',
    acceptCommittee: 'info',
    acceptFinance: 'info',
    acceptDepartment: 'info',
    acceptDocument: 'info',
    record: 'info',
    finished: '',
    cancelled: 'danger'
  };

  return Model.extend({

    urlRoot: '/fa/lt',

    clientUrlRoot: '#fa/lt',

    topicPrefix: 'fa.lt',

    privilegePrefix: 'FA:LT',

    nlsDomain: 'fa-lt',

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
      obj.stage = t(this.nlsDomain, 'stage:' + obj.stage, {kind: obj.kind});
      obj.kind = t(this.nlsDomain, 'kind:short:' + obj.kind);
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

      obj.protocolDate = obj.protocolDate ? time.utc.format(obj.protocolDate, 'LL') : '';
      obj.documentDate = obj.documentDate ? time.utc.format(obj.documentDate, 'LL') : '';
      obj.kind = t(this.nlsDomain, 'kind:' + this.get('kind'));
      obj.mergeType = obj.mergeType ? t(this.nlsDomain, 'mergeType:' + obj.mergeType) : '';
      obj.owner = userInfoTemplate({userInfo: obj.owner});
      obj.applicant = userInfoTemplate({userInfo: obj.applicant});
      obj.committee = obj.committee.map(function(userInfo) { return userInfoTemplate({userInfo: userInfo}); });

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
      obj.protocolDate = obj.protocolDate ? time.utc.format(obj.protocolDate, 'YYYY-MM-DD') : '';
      obj.documentDate = obj.documentDate ? time.utc.format(obj.documentDate, 'YYYY-MM-DD') : '';

      return obj;
    },

    canEdit: function()
    {
      return this.constructor.can.edit(this);
    },

    canManage: function()
    {
      return this.constructor.can.manage(this);
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

        if (stage === 'cancelled')
        {
          return false;
        }

        if (stage === 'finished')
        {
          return user.isAllowedTo('SUPER');
        }

        if (stage === 'acceptCommittee')
        {
          var committeeAcceptance = model.get('committeeAcceptance');

          if (committeeAcceptance && committeeAcceptance[user.data[user.idProperty]])
          {
            return true;
          }
        }

        return user.isAllowedTo('FA:MANAGE', 'FA:LT:MANAGE', 'FA:LT:' + model.get('stage'));
      },
      manage: function(model)
      {
        return user.isAllowedTo('FA:MANAGE', 'FA:LT:MANAGE', 'FA:LT:' + model.get('stage'));
      },
      delete: function()
      {
        return user.data.login === 'root';
      }
    },

    STATUSES: [
      'protocol',
      'acceptCommittee',
      'verify',
      'acceptOwner',
      'acceptFinance',
      'acceptDepartment',
      'acceptDocument',
      'record',
      'finished',
      'cancelled'
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
