// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/pages/EditFormPage',
  'app/fa-common/views/ChangesView',
  '../views/edit/FormView',
  'app/fa-ot/templates/edit/page'
], function(
  _,
  $,
  EditFormPage,
  ChangesView,
  FormView,
  template
) {
  'use strict';

  return EditFormPage.extend({

    pageClassName: 'page-max-flex',

    template: template,

    FormView: FormView,

    initialize: function()
    {
      EditFormPage.prototype.initialize.apply(this, arguments);

      this.onResize = _.debounce(this.resize.bind(this), 16);

      $(window)
        .on('resize.' + this.idPrefix, this.onResize)
        .on('scroll.' + this.idPrefix, this.resize.bind(this));
    },

    destroy: function()
    {
      EditFormPage.prototype.destroy.apply(this, arguments);

      $(window).off('.' + this.idPrefix);
    },

    defineViews: function()
    {
      EditFormPage.prototype.defineViews.apply(this, arguments);

      this.changesView = new ChangesView({model: this.model});

      this.setView('#-form', this.view);
      this.setView('#-changes', this.changesView);
    },

    afterRender: function()
    {
      EditFormPage.prototype.afterRender.apply(this, arguments);

      this.resize();
    },

    resize: function()
    {
      var rect = this.$id('form')[0].getBoundingClientRect();
      var top = Math.max(rect.top, 30);
      var left = rect.right + 30;
      var height = window.innerHeight - top - 30;
      var fixed = window.innerWidth >= 1600;

      this.$id('changes').toggleClass('fa-changes-fixed', fixed).find('.fa-changes').css({
        top: top + 'px',
        left: left + 'px',
        height: fixed ? (height + 'px') : ''
      });

      this.changesView.scrollToBottom();
    }

  });
});
