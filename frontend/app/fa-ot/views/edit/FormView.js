// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/onModelDeleted',
  './stages',
  'app/fa-ot/templates/edit/form'
], function(
  _,
  user,
  viewport,
  FormView,
  onModelDeleted,
  stages,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    localTopics: {
      'user.reloaded': 'render'
    },

    remoteTopics: function()
    {
      var topics = {};
      var prefix = this.model.getTopicPrefix();

      topics[prefix + '.updated.' + this.model.id] = 'onUpdated';
      topics[prefix + '.deleted'] = 'onDeleted';

      return topics;
    },

    events: Object.assign({

      'click .panel-footer .btn[value]': function(e)
      {
        this.stageView.handleFormAction(e.currentTarget.value, this);
      },

      'click #-submit': function(e)
      {
        this.submitClicked = !!e.originalEvent && e.originalEvent.x !== 0 && e.originalEvent.y !== 0;
      },

      'change input, select, textarea': function()
      {
        this.$('.is-invalid').removeClass('is-invalid');

        this.model.trigger('dirty');
      },

      'input input, textarea': function()
      {
        this.model.trigger('dirty');
      },

      'keyup textarea[name="comment"]': function(e)
      {
        if (e.key === 'Enter' && e.ctrlKey)
        {
          this.$id('submit').click();
        }
      },

      'input input[data-maxlength]': function(e)
      {
        e.target.setCustomValidity('');
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      this.stageView = null;

      this.listenTo(this.model, 'dirty', this.enableSubmit);
    },

    getTemplateData: function()
    {
      return {
        tabs: this.getTabs(),
        actions: this.stageView ? this.stageView.getFormActions() : [],
        canEdit: this.model.canEdit()
      };
    },

    getStages: function()
    {
      return stages;
    },

    getTabs: function()
    {
      var tabs = Object.keys(stages);

      return this.model.get('protocolNeeded') ? tabs : tabs.slice(2);
    },

    beforeRender: function()
    {
      var StageView = this.getStages()[this.model.get('stage')];

      if (!StageView)
      {
        return;
      }

      if (this.stageView instanceof StageView)
      {
        return;
      }

      this.newStage = !!this.stageView;

      this.stageView = new StageView({
        model: this.model
      });

      this.setView('#-stage', this.stageView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.handleNextRequest = null;

      var $tabs = this.$id('tabs');

      if ($tabs[0].scrollWidth > $tabs[0].clientWidth)
      {
        var $active = $tabs.find('.is-active');

        $tabs[0].scrollLeft = $active[0].offsetLeft - ($tabs.outerWidth() - $active.outerWidth()) / 2;
      }

      if (this.newStage)
      {
        this.newStage = false;

        this.$id('tabs')[0].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start'
        });
      }
    },

    serializeForm: function(formData)
    {
      return this.stageView && this.stageView.serializeForm
        ? this.stageView.serializeForm(formData)
        : formData;
    },

    serializeToForm: function()
    {
      var formData = this.model.serializeForm();

      delete formData.comment;

      return this.stageView && this.stageView.serializeToForm
        ? this.stageView.serializeToForm(formData)
        : formData;
    },

    submit: function(options)
    {
      if (this.saving || !this.model.canEdit())
      {
        return;
      }

      if (!options)
      {
        options = {};
      }

      var toggleRequired = options.toggleRequired !== false;

      clearTimeout(this.timers.toggleRequired);
      clearTimeout(this.timers.toggleSelect2Validity);

      if (toggleRequired)
      {
        this.timers.toggleRequired = setTimeout(this.toggleRequired.bind(this, false), 3000);
        this.timers.toggleSelect2Validity = setTimeout(this.toggleSelect2Validity.bind(this), 1);

        this.toggleRequired(true);
      }

      this.$id('submit').prop('disabled', false).click();
    },

    toggleRequired: function(required)
    {
      var view = this;

      view.$('[data-required]').each(function()
      {
        this.required = required;
      });

      view.$('input[data-maxlength]').each(function()
      {
        var limits = this.dataset.maxlength.split(' ');
        var maxLength = limits[1];
        var error = '';

        if (required)
        {
          maxLength = limits[0];
          error = this.value.length > maxLength
            ? view.t('fa-common', 'FORM:edit:maxLength', {limit: maxLength})
            : '';
        }

        this.maxLength = maxLength;
        this.setCustomValidity(error);
      });

      if (!required)
      {
        view.$('.is-invalid').removeClass('is-invalid');
      }

      view.model.trigger('required', required);
    },

    toggleSelect2Validity: function()
    {
      this.$('.select2-container').each(function()
      {
        this.classList.toggle('is-invalid', !this.nextElementSibling.validity.valid);
      });
    },

    submitRequest: function()
    {
      this.saving = true;

      clearTimeout(this.timers.toggleSelect2Validity);
      this.timers.toggleSelect2Validity = null;

      if (this.submitClicked)
      {
        if (this.handleNextRequest)
        {
          this.handleNextRequest(true);
        }

        this.submitClicked = false;
        this.handleNextRequest = null;
      }

      viewport.msg.saving();

      this.oldStage = this.model.get('stage');

      this.$('.panel-footer').find('.btn').prop('disabled', true);

      var files = this.$('input[type="file"]').filter(function() { return !!this.value; }).get();

      this.uploadNextFile(files, arguments);
    },

    uploadNextFile: function(files, submitArgs)
    {
      var view = this;

      if (files.length === 0)
      {
        FormView.prototype.submitRequest.apply(view, submitArgs);

        return;
      }

      var file = files.shift();
      var formData = new FormData();

      formData.append('file', file.files[0]);

      var req = view.ajax({
        type: 'POST',
        url: '/fa/attachments;upload',
        data: formData,
        processData: false,
        contentType: false
      });

      req.fail(view.handleFailure.bind(this));

      req.done(function(attachment)
      {
        view.model.set(file.name, attachment);
        view.uploadNextFile(files, submitArgs);
      });
    },

    handleSuccess: function()
    {
      this.saving = false;

      viewport.msg.saved();

      if (this.timers.toggleRequired)
      {
        clearTimeout(this.timers.toggleRequired);
        this.timers.toggleRequired = null;

        this.toggleRequired(false);
      }

      if (this.handleNextRequest)
      {
        this.handleNextRequest(false);
        this.handleNextRequest = null;
      }

      var newStage = this.model.get('stage');
      var cancelled = newStage === 'cancelled';
      var record = this.oldStage === 'record' && newStage === this.oldStage;
      var finished = this.oldStage === 'finished' && newStage === this.oldStage;
      var finishing = this.oldStage === 'record' && newStage === 'finished';

      if (cancelled
        || finished
        || finishing
        || (record && !this.model.constructor.can.edit(this.model)))
      {
        FormView.prototype.handleSuccess.apply(this, arguments);
      }
      else
      {
        this.render();
      }
    },

    handleFailure: function()
    {
      this.saving = false;

      viewport.msg.hide(null, true);
      viewport.msg.savingFailed();

      this.$('.panel-footer').find('.btn').prop('disabled', false);

      if (this.handleNextRequest)
      {
        this.handleNextRequest(true);
        this.handleNextRequest = null;
      }
    },

    enableSubmit: function()
    {
      if (!this.saving && this.model.canEdit())
      {
        this.$id('submit').prop('disabled', false);
      }
    },

    onUpdated: function(message)
    {
      var changes = this.model.get('changes');

      if (_.isEqual(message.change, _.last(changes)))
      {
        return;
      }

      var data = Object.assign(
        {changes: changes.concat([message.change])},
        message.values
      );

      _.forEach(message.change.data, function(value, prop)
      {
        data[prop] = value[1];
      });

      this.model.set(data);
    },

    onDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message, false);
    }

  });
});
