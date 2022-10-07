// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'jquery',
  'underscore',
  'app/user',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/onModelDeleted',
  '../../FaOt',
  './stages',
  'app/fa-ot/templates/edit/form'
], function(
  require,
  $,
  _,
  user,
  viewport,
  FormView,
  onModelDeleted,
  FaOt,
  stages,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    localTopics: {
      'user.reloaded': 'render'
    },

    remoteTopics: function()
    {
      const prefix = this.model.getTopicPrefix();

      return {
        [`${prefix}.updated.${this.model.id}`]: 'onUpdated',
        [`${prefix}.deleted`]: 'onDeleted'
      };
    },

    events: Object.assign({

      'click .panel-footer .btn[value]': function(e)
      {
        if (!e.currentTarget.parentNode.classList.contains('btn-group'))
        {
          this.handleFormAction(e.currentTarget.value);
        }
      },

      'click a[data-action]': function(e)
      {
        const parentAction = this.$(e.target).closest('.btn-group').find('.dropdown-toggle[value]')[0];

        this.handleFormAction(
          e.currentTarget.dataset.action,
          parentAction ? parentAction.value : null
        );
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
      },

      'change input[type="file"]': function(e)
      {
        const inputEl = e.currentTarget;
        let error = '';

        if (inputEl.files.length && inputEl.files[0].size > window.FA_ATTACHMENT_MAX_SIZE)
        {
          error = this.t('fa-common', 'FORM:edit:maxSize', {
            size: Math.floor(window.FA_ATTACHMENT_MAX_SIZE / 1024 / 1024)
          });
        }

        inputEl.setCustomValidity(error);
      },

      'keyup input[type="file"]': function(e)
      {
        if (e.key === 'Escape')
        {
          e.currentTarget.value = '';
          e.currentTarget.setCustomValidity('');
        }
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      this.stageView = null;

      this.listenTo(this.model, 'dirty', this.enableSubmit);
    },

    serializeFormActions: function()
    {
      const stage = this.model.get('stage');

      return (this.stageView ? this.stageView.getFormActions() : []).map(action =>
      {
        if (!action.label)
        {
          action.label = this.t.has(`FORM:ACTION:${stage}:${action.id}`)
            ? this.t(`FORM:ACTION:${stage}:${action.id}`)
            : this.t(`FORM:ACTION:${action.id}`);
        }

        if (!action.title)
        {
          const data = {
            kind: this.model.get('kind')
          };

          action.title = this.t.has(`FORM:ACTION:${stage}:${action.id}:title`)
            ? this.t(`FORM:ACTION:${stage}:${action.id}:title`, data)
            : this.t.has(`FORM:ACTION:${action.id}:title`)
              ? this.t(`FORM:ACTION:${action.id}:title`, data)
              : '';
        }

        action.actions = (action.actions || []).map(subAction =>
        {
          if (typeof subAction === 'string')
          {
            subAction = {id: subAction};
          }

          if (!subAction.label)
          {
            subAction.label = this.t.has(`FORM:ACTION:${stage}:${action.id}:${subAction.id}`)
              ? this.t(`FORM:ACTION:${stage}:${action.id}:${subAction.id}`)
              : this.t(`FORM:ACTION:${action.id}:${subAction.id}`);
          }

          return subAction;
        });

        return action;
      });
    },

    getTemplateData: function()
    {
      return {
        tabs: this.getTabs(),
        actions: this.serializeFormActions(),
        canEdit: this.model.canEdit(),
        stage: this.model.get('stage')
      };
    },

    getStages: function()
    {
      return stages;
    },

    getTabs: function()
    {
      const tabs = Object.keys(stages);

      return this.model.get('protocolNeeded') ? tabs : tabs.slice(1);
    },

    beforeRender: function()
    {
      const StageView = this.getStages()[this.model.get('stage')];

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
        model: this.model,
        formView: this
      });

      this.setView('#-stage', this.stageView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.handleNextRequest = null;

      const $tabs = this.$id('tabs');

      if ($tabs[0].scrollWidth > $tabs[0].clientWidth)
      {
        const $active = $tabs.find('.is-active');

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

      this.toggleActionsVisibility();
    },

    toggleActionsVisibility: function()
    {
      const canEdit = this.model.canEdit();

      this.$('.panel-footer').toggleClass('hidden', !canEdit);

      if (!canEdit)
      {
        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl(),
          trigger: true,
          replace: true
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
      const formData = this.model.serializeForm();

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

      const toggleRequired = options.toggleRequired !== false;

      clearTimeout(this.timers.toggleRequired);
      clearTimeout(this.timers.toggleSelect2Validity);

      if (toggleRequired)
      {
        this.timers.toggleRequired = setTimeout(this.toggleRequired.bind(this, false), 3000);
        this.timers.toggleSelect2Validity = setTimeout(this.toggleSelect2Validity.bind(this), 1);

        this.toggleRequired(true);
      }

      this.timers.resetChangedStage = setTimeout(this.resetChangedStage.bind(this, false), 1);

      this.$id('submit').prop('disabled', false).click();
    },

    toggleRequired: function(required)
    {
      const view = this;

      view.$('[data-required]').each(function()
      {
        this.required = required;
      });

      view.$('input[data-maxlength]').each(function()
      {
        const limits = this.dataset.maxlength.split(' ');
        let maxLength = limits[1];
        let error = '';

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

    resetChangedStage: function()
    {
      if (this.handleNextRequest)
      {
        this.handleNextRequest(false);
        this.handleNextRequest = null;
      }
    },

    submitRequest: function()
    {
      this.saving = true;

      clearTimeout(this.timers.resetChangedStage);
      this.timers.resetChangedStage = null;

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

      this.editState = this.model.id ? null : this.model.toJSON();
      this.oldStage = this.model.get('stage');

      this.$('.panel-footer').find('.btn').prop('disabled', true);

      const files = this.$('input[type="file"]').filter(function() { return !!this.value; }).get();

      this.uploadNextFile(files, arguments);
    },

    request(formData)
    {
      if (this.model.id)
      {
        return FormView.prototype.request.apply(this, arguments);
      }

      const multiReq = $.Deferred();
      const addReq = FormView.prototype.request.call(this, this.model.attributes);

      addReq.done(() =>
      {
        const editReq = this.request(formData);

        editReq.done((...args) =>
        {
          multiReq.resolve(...args);
        });

        editReq.fail((...args) =>
        {
          multiReq.reject(...args);
        });
      });

      addReq.fail((...args) =>
      {
        multiReq.reject(...args);
      });

      return multiReq.promise();
    },

    uploadNextFile: function(files, submitArgs)
    {
      if (files.length === 0)
      {
        FormView.prototype.submitRequest.apply(this, submitArgs);

        return;
      }

      const file = files.shift();
      const formData = new FormData();

      formData.append('file', file.files[0]);

      const req = this.ajax({
        type: 'POST',
        url: '/fa/attachments;upload',
        data: formData,
        processData: false,
        contentType: false
      });

      req.fail(this.handleFailure.bind(this));

      req.done(attachment =>
      {
        this.model.set(file.name, attachment);
        this.uploadNextFile(files, submitArgs);
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

      const newStage = this.model.get('stage');
      const cancelled = newStage === 'cancelled';
      const finished = this.oldStage === 'finished' && newStage === this.oldStage;
      const finishing = this.oldStage === 'record' && newStage === 'finished';

      if (this.dontRedirectAfterSubmit)
      {
        this.dontRedirectAfterSubmit = false;

        this.render();

        return;
      }

      if (!this.model.canEdit() || cancelled || finished || finishing)
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
      if (message.socketId === this.socket.getId())
      {
        return;
      }

      const data = Object.assign(
        {changes: this.model.get('changes').concat([message.change])},
        message.values
      );
      let anyPropChanged = false;

      _.forEach(message.change.data, function(value, prop)
      {
        anyPropChanged = true;
        data[prop] = value[1];
      });

      this.model.set(data);

      if (message.socketId !== this.socket.getId() && anyPropChanged)
      {
        if (message.change.data.stage)
        {
          this.render();
        }
        else
        {
          this.stageView.render();
        }
      }
    },

    onDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message, false);
    },

    handleFormAction: function(action, parentAction)
    {
      if (/cancel$/i.test(action) || /cancel/i.test(parentAction))
      {
        this.handleCancelAction(this);
      }
      else if (/reject$/i.test(action) || /reject$/i.test(parentAction))
      {
        this.handleRejectAction(action, this);
      }
      else
      {
        this.stageView.handleFormAction(action, this);
      }
    },

    handleNewStageAction: function(newStage, options)
    {
      this.model.set('newStage', newStage);

      this.handleNextRequest = () => this.model.set('newStage', null);

      this.submit(options && options.submit || {});
    },

    handleCancelAction: function(formView)
    {
      if (!this.model.id)
      {
        const AddFormPage = require('app/fa-ot/pages/AddFormPage');

        viewport.showPage(new AddFormPage({
          model: FaOt.createNew()
        }));

        return;
      }

      if (!this.requireComment())
      {
        return;
      }

      this.model.set('newStage', 'cancelled');

      formView.handleNextRequest = () => formView.model.set('newStage', null);

      formView.submit({toggleRequired: false});
    },

    handleRejectAction: function(action, formView)
    {
      if (!this.requireComment())
      {
        return;
      }

      this.stageView.handleFormAction(action, formView);
    },

    requireComment: function()
    {
      const $comment = this.stageView.$id('comment').removeClass('highlight-error');

      if ($comment.length && $comment.val().trim().length === 0)
      {
        $comment.focus();

        $comment.addClass('highlight-error');

        return false;
      }

      return true;
    }

  });
});
