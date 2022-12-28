// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/time',
  'app/viewport',
  'app/user',
  'app/core/views/FormView',
  'app/core/util/uuid',
  'app/fa-common/dictionaries',
  'app/fa-ot/FaOt',
  'app/fa-ot/templates/addForm'
], function(
  require,
  time,
  viewport,
  currentUser,
  FormView,
  uuid,
  dictionaries,
  FaOt,
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
        zplx: [],
        committee: [],
        postingDate: null,
        protocolFile: null,
        checklistFile: null,
        certificateFile: null,
        outlayFile: null,
        nameplateFile: null,
        hrtFile: null,
        attachmentFile: null,
        assets: [FaOt.createNewAsset()],
        users: [],
        changes: []
      });

      viewport.showPage(dictionaries.bind(new EditFormPage({
        model: this.model
      })));
    }

  });
});
