// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/time',
  'app/viewport',
  'app/user',
  'app/core/views/FormView',
  'app/fa-common/dictionaries',
  'app/fa-ot/templates/addForm'
], function(
  require,
  time,
  viewport,
  currentUser,
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change [name="commissioningType"]'()
      {
        const extendedDep = this.$('[name="commissioningType"]:checked').val() === 'inc-asset';

        this.$id('extendedDep')
          .toggleClass('hidden', !extendedDep)
          .find('[value="false"]')
          .prop('checked', true);
      }

    }, FormView.prototype.events),

    handleSuccess()
    {
      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl('edit'),
        trigger: true,
        replace: false
      });
    },

    submitRequest($submitEl, formData)
    {
      const EditFormPage = require('app/fa-ot/pages/EditFormPage');
      const date = time.getMoment().startOf('day').utc(true).toISOString();
      const protocolNeeded = !!formData.protocolNeeded;

      this.model.set({
        createdAt: new Date().toISOString(),
        createdBy: currentUser.getInfo(),
        updatedAt: null,
        updatedBy: null,
        stage: protocolNeeded ? 'protocol' : 'document',
        stageChangedAt: {},
        stageChangedBy: {},
        protocolNeeded,
        commissioningType: formData.commissioningType,
        usageDestination: formData.usageDestination,
        extendedDep: !!formData.extendedDep,
        protocolNo: '',
        protocolNoInc: 0,
        documentNo: '',
        documentNoInc: 0,
        date,
        protocolDate: protocolNeeded ? date : null,
        documentDate: protocolNeeded ? null : date,
        inventoryNo: '',
        serialNo: '',
        assetName: '',
        assetNameSearch: '',
        lineSymbol: '',
        zplx: [],
        owner: null,
        committee: [],
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
        postingDate: null,
        vendorNo: '',
        vendorName: '',
        vendorNameSearch: '',
        assetNo: '',
        accountingNo: '',
        odwNo: '',
        tplNotes: '',
        protocolFile: null,
        checklistFile: null,
        certificateFile: null,
        outlayFile: null,
        nameplateFile: null,
        photoFile: null,
        hrtFile: null,
        attachmentFile: null,
        users: [],
        changes: []
      });

      viewport.showPage(dictionaries.bind(new EditFormPage({
        model: this.model
      })));
    }

  });
});
