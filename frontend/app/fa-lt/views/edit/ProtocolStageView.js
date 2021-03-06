// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  'app/fa-lt/templates/edit/protocol'
], function(
  _,
  time,
  user,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  StageView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

    events: {

      'change #-costCenter': function()
      {
        var costCenter = dictionaries.costCenters.get(this.$id('costCenter').val());

        if (!costCenter)
        {
          return;
        }

        var owner = costCenter.get('owner');

        if (!owner)
        {
          return;
        }

        var $owner = this.$id('owner');

        if ($owner.length)
        {
          $owner.select2('data', {
            id: owner[user.idProperty],
            text: owner.label
          });
        }
      }

    },

    getTemplateData: function()
    {
      return {
        model: this.model.toJSON(),
        details: this.model.serializeDetails()
      };
    },

    afterRender: function()
    {
      var view = this;

      view.setUpCostCenterSelect2();
      view.setUpUserSelect2(view.$id('owner'), view.model.get('owner'));
      view.setUpUserSelect2(view.$id('applicant'), view.model.get('applicant') || user.getInfo());
      view.setUpUserSelect2(view.$id('committee'), view.model.get('committee'), {
        collection: dictionaries.committee,
        multiple: true
      });
    },

    setUpCostCenterSelect2: function()
    {
      var id = this.model.get('costCenter');
      var model = dictionaries.costCenters.get(id);
      var data = [];

      if (id && !model)
      {
        data.push({
          id: id,
          text: id
        });
      }

      dictionaries.costCenters.forEach(function(d)
      {
        if (d.get('active') || d.id === id)
        {
          data.push(idAndLabel(d));
        }
      });

      this.$id('costCenter').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: data
      });
    },

    setUpUserSelect2: function($input, users, options)
    {
      setUpUserSelect2($input, _.assign({
        width: '100%'
      }, options));

      if (users)
      {
        if (!Array.isArray(users))
        {
          users = [users];
        }

        var data = users.map(function(u)
        {
          return {
            id: u._id,
            text: u.label
          };
        });

        $input.select2('data', options && options.multiple ? data : data[0]);
      }
    },

    getFormActions: function()
    {
      var actions = [];

      if (this.model.canEdit())
      {
        actions.push({
          id: 'nextStep',
          className: 'btn-success',
          icon: 'fa-check'
        });
      }

      if (this.model.canCancel())
      {
        actions.push({
          id: 'cancel',
          className: 'btn-danger btn-push-right',
          icon: 'fa-stop'
        });
      }

      return actions;
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'nextStep')
      {
        this.handleNextStepAction(formView);
      }
    },

    handleNextStepAction: function(formView)
    {
      this.model.set('newStage', 'acceptCommittee');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    serializeForm: function(formData)
    {
      var data = {
        comment: (formData.comment || '').trim(),
        protocolDate: formData.protocolDate
          ? time.utc.getMoment(formData.protocolDate, 'YYYY-MM-DD').toISOString()
          : null,
        inventoryNo: (formData.inventoryNo || '').trim(),
        assetName: (formData.assetName || '').trim(),
        costCenter: formData.costCenter || null,
        owner: setUpUserSelect2.getUserInfo(this.$id('owner')),
        applicant: setUpUserSelect2.getUserInfo(this.$id('applicant')),
        committee: setUpUserSelect2.getUserInfo(this.$id('committee')),
        committeeAcceptance: {},
        cause: (formData.cause || '').trim()
      };

      data.committee.forEach(function(userInfo)
      {
        data.committeeAcceptance[userInfo[user.idProperty]] = {
          time: new Date(),
          user: userInfo,
          status: null
        };
      });

      return data;
    }

  });
});
