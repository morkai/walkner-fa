// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FormView',
  '../FaLt',
  'app/fa-lt/templates/addForm'
], function(
  user,
  FormView,
  FaLt,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    localTopics: {
      'user.reloaded': 'render'
    },

    events: Object.assign({

      'change input[name="kind"]': function()
      {
        this.toggleKind();
      },

      'change input[name="mergeType"]': function()
      {
        this.toggleMergeType();
      }

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      return {
        kinds: FaLt.KINDS,
        mergeTypes: FaLt.MERGE_TYPES
      };
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.toggleKind();
      this.toggleMergeType();
    },

    handleSuccess: function()
    {
      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl('edit'),
        trigger: true,
        replace: false
      });
    },

    toggleKind: function()
    {
      var view = this;
      var kind = view.$('input[name="kind"]:checked').val();
      var anyVisible = false;

      view.$('div[data-kind]').each(function()
      {
        var visible = this.dataset.kind === kind;

        this.classList.toggle('hidden', !visible);

        view.$(this).find('[data-required]').each(function()
        {
          this.required = visible;
        });

        anyVisible = anyVisible || visible;
      });

      this.$('.panel-body').toggleClass('has-lastElementRow', !anyVisible);
    },

    toggleMergeType: function()
    {
      var view = this;
      var mergeType = view.$('input[name="mergeType"]:checked').val();
      var placeholder = mergeType === 'full' ? '' : view.t('FORM:add:mergeNotes:placeholder');

      view.$id('mergeNotes').prop('placeholder', placeholder);
    },

    serializeForm: function(formData)
    {
      formData.comment = formData.otherNotes || formData.mergeNotes || '';

      delete formData.otherNotes;
      delete formData.mergeNotes;

      return formData;
    }

  });
});
