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

  const VALUE_PROPS = [
    'initialValue',
    'deprecationValue',
    'netValue',
    'economicInitialValue',
    'economicDeprecationValue',
    'economicNetValue',
    'saleValue'
  ];
  const STAGE_TO_CLASS_NAME = {
    protocol: 'info',
    verify: 'info',
    acceptOwner: 'info',
    acceptCommittee: 'info',
    acceptFinance: 'info',
    acceptDepartment: 'info',
    verifyDocument: 'info',
    acceptDocument: 'info',
    record: 'info',
    finished: '',
    cancelled: 'danger'
  };
  const DATE_PROPS = [
    'protocolDate',
    'documentDate',
    'postingDate',
    'valuationDate'
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
      return this.get('documentNo') || this.get('protocolNo');
    },

    serializeRow: function()
    {
      const obj = this.toJSON();

      obj.className = STAGE_TO_CLASS_NAME[obj.stage] || '';
      obj.url = this.url();
      obj.no = this.getLabel();
      obj.stage = t(this.nlsDomain, `stage:${obj.stage}`, {kind: obj.kind});
      obj.kind = t(this.nlsDomain, `kind:short:${obj.kind}`);
      obj.date = time.utc.format(obj.date, 'L');
      obj.assetNos = obj.assets && obj.assets.length > 1 ? obj.assets.map(a => a.no).join('\n') : '';
      obj.assetNo = obj.assets && obj.assets.length ? obj.assets[0].no : '';

      if (obj.assets && obj.assets.length > 1)
      {
        obj.assetNo += ` +${obj.assets.length - 1}`;
      }

      obj.accountingNos = obj.assets && obj.assets.length > 1 ? obj.assets.map(a => a.accountingNo).join('\n') : '';
      obj.accountingNo = obj.assets && obj.assets.length ? obj.assets[0].accountingNo : '';

      if (obj.assets && obj.assets.length > 1)
      {
        obj.accountingNo += ` +${obj.assets.length - 1}`;
      }

      VALUE_PROPS.forEach(prop =>
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
      const obj = this.serializeRow();

      obj.acceptable = this.isAcceptable();

      DATE_PROPS.forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.utc.format(obj[prop], 'LL') : '';
      });

      obj.kind = t(this.nlsDomain, `kind:${this.get('kind')}`);
      obj.mergeType = obj.mergeType ? t(this.nlsDomain, `mergeType:${obj.mergeType}`) : '';
      obj.owner = userInfoTemplate(obj.owner);
      obj.applicant = userInfoTemplate(obj.applicant);
      obj.committee = obj.committee.map(userInfo => userInfoTemplate(userInfo));

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

      Object.keys(obj.stageChangedBy).forEach(stage =>
      {
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
      return this.get('changes').filter(c => !!c.comment).map(c =>
      {
        return {
          time: time.format(c.date, 'L LT'),
          user: userInfoTemplate(c.user, {noIp: true}),
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
      var applicant = this.get('applicant');

      return !!applicant && applicant._id === user.data._id;
    },

    isOwner: function()
    {
      var owner = this.get('owner');

      return !!owner && owner._id === user.data._id;
    },

    isCommittee: function()
    {
      return _.some(this.get('committee'), u => u._id === user.data._id);
    },

    isAcceptable: function()
    {
      const attrs = this.attributes;

      if (!attrs.stageChangedAt.verify)
      {
        return false;
      }

      return true;
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
          case 'verifyDocument':
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
      'verifyDocument',
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
    ],

    createNew()
    {
      return new this({
        kind: 'scrap',
        mergeType: 'full'
      });
    }

  });
});
