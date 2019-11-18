// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  _,
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

    isApplicant: function()
    {
      return this.get('applicant')._id === user.data._id;
    },

    isOwner: function()
    {
      return this.get('owner')._id === user.data._id;
    },

    isCommittee: function()
    {
      return _.some(this.get('committee'), function(u) { return u._id === user.data._id; });
    }

  }, {

    can: {
      add: function()
      {
        return user.isAllowedTo('FA:MANAGE', 'FA:LT:MANAGE', 'FA:LT:ADD');
      },
      edit: function(model)
      {
        if (user.isAllowedTo('FA:MANAGE', 'FA:LT:MANAGE'))
        {
          return true;
        }

        var stage = model.get('stage');

        switch (stage)
        {
          case 'protocol':
            return model.isCreator() || model.isApplicant();

          case 'acceptCommittee':
            return model.isCommittee();

          case 'acceptOwner':
          case 'acceptDocument':
            return model.isOwner();

          case 'verify':
          case 'record':
          case 'acceptFinance':
          case 'acceptDepartment':
            return user.isAllowedTo('FA:LT:' + stage);

          case 'finished':
            return user.isAllowedTo('SUPER');

          case 'cancelled':
            return user.data.login === 'root';
        }

        return false;
      },
      manage: function()
      {
        return user.isAllowedTo('FA:MANAGE', 'FA:LT:MANAGE');
      },
      cancel: function(model)
      {
        return model.isCreator() || user.isAllowedTo('FA:MANAGE', 'FA:LT:MANAGE');
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
