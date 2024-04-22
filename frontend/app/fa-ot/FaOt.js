// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/util/uuid',
  'app/core/templates/userInfo',
  'app/fa-common/dictionaries',
  'app/fa-common/util/formatPeriod'
], function(
  _,
  t,
  time,
  currentUser,
  Model,
  uuid,
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
  const DATE_PROPS = [
    'protocolDate',
    'documentDate',
    'postingDate'
  ];
  const ASSET_DATE_PROPS = [
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

    initialize()
    {
      this.details = null;

      this.on('change', () =>
      {
        this.details = null;
      });
    },

    getLabel()
    {
      return this.get('documentNo') || this.get('protocolNo');
    },

    serialize()
    {
      const obj = this.toJSON();

      obj.className = STAGE_TO_CLASS_NAME[obj.stage] || '';
      obj.url = this.url();
      obj.no = this.getLabel();
      obj.stage = t(this.nlsDomain, `stage:${obj.stage}`);
      obj.date = time.utc.format(obj.date, 'L');

      return obj;
    },

    serializeRow()
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

    serializeDetails()
    {
      if (this.details)
      {
        return this.details;
      }

      const obj = this.details = this.serialize();
      const {protocolNeeded} = obj;

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

      obj.zplx = obj.zplx.map(zplx =>
      {
        return {
          code: zplx.code,
          value: !zplx.value ? '' : dictionaries.currencyFormatter.format(zplx.value),
          auc: zplx.auc
        };
      });

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

      obj.assets = this.serializeAssets();

      return obj;
    },

    serializeAssets()
    {
      return this.get('assets').map(asset => this.serializeAsset(asset));
    },

    serializeAsset(asset)
    {
      const obj = {...asset};

      obj.owner = userInfoTemplate(obj.owner);
      obj.depRate = obj.depRate.toLocaleString() + '%';
      obj.value = dictionaries.currencyFormatter.format(obj.value || 0);
      obj.transactions = obj.transactions.map(t =>
      {
        return {
          type: t.type,
          amount1: dictionaries.currencyFormatter.format(t.amount1),
          amount2: dictionaries.currencyFormatter.format(t.amount2)
        };
      });
      obj.economicPeriod = formatPeriod(obj.economicPeriod);
      obj.fiscalPeriod = formatPeriod(obj.fiscalPeriod);
      obj.taxPeriod = formatPeriod(obj.taxPeriod);

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

      ASSET_DATE_PROPS.forEach(prop =>
      {
        obj[prop] = obj[prop] ? time.utc.format(obj[prop], 'LL') : '';
      });

      return obj;
    },

    serializeComments()
    {
      return this.get('changes').filter(c => !!c.comment).map(c =>
      {
        return {
          time: time.format(c.date, 'L LT'),
          user: userInfoTemplate({userInfo: c.user, noIp: true}),
          text: c.comment
        };
      });
    },

    serializeForm()
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
      return _.includes(this.get('users'), currentUser.data._id);
    },

    isCreator: function()
    {
      return this.get('createdBy')._id === currentUser.data._id;
    },

    isOwner()
    {
      return this.get('assets').some(a => !!a.owner && a.owner._id === currentUser.data._id);
    }

  }, {

    can: {
      add: function()
      {
        return currentUser.isAllowedTo('FA:MANAGE', 'FA:OT:MANAGE', 'FA:OT:ADD');
      },
      edit: function(model)
      {
        if (currentUser.isAllowedTo('FA:MANAGE', 'FA:OT:MANAGE'))
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
            return currentUser.isAllowedTo('FA:OT:' + stage);

          case 'finished':
            return currentUser.isAllowedTo('SUPER');

          case 'cancelled':
            return currentUser.data.login === 'root';
        }

        return false;
      },
      cancel: function(model)
      {
        return model.isCreator() || currentUser.isAllowedTo('FA:MANAGE', 'FA:OT:MANAGE');
      },
      delete: function()
      {
        return currentUser.data.login === 'root';
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
    ],

    createNew()
    {
      return new this({
        protocolNeeded: true,
        commissioningType: 'new-asset',
        extendedDep: false,
        usageDestination: 'factory',
        assets: [this.createNewAsset()]
      });
    },

    createNewAsset()
    {
      return {
        _id: uuid(),
        inventoryNo: '',
        serialNo: '',
        assetName: '',
        assetNameSearch: '',
        lineSymbol: '',
        owner: null,
        supplier: '',
        supplierSearch: '',
        costCenter: null,
        evalGroup1: '',
        evalGroup5: '',
        assetClass: null,
        depRate: 0,
        depKey: '',
        economicMethod: '',
        fiscalMethod: '',
        taxMethod: '',
        economicPeriod: 0,
        fiscalPeriod: 0,
        taxPeriod: 0,
        economicDate: null,
        fiscalDate: null,
        taxDate: null,
        value: 0,
        transactions: [],
        vendorNo: '',
        vendorName: '',
        vendorNameSearch: '',
        assetNo: '',
        accountingNo: '',
        odwNo: '',
        tplNotes: '',
        photoFile: null
      };
    }

  });
});
