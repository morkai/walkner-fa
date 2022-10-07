// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/pages/EditFormPage',
  'app/core/pages/createPageBreadcrumbs',
  'app/fa-common/views/ChangesView',
  '../views/edit/FormView',
  'app/fa-ot/templates/edit/page'
], function(
  _,
  $,
  EditFormPage,
  createPageBreadcrumbs,
  ChangesView,
  FormView,
  template
) {
  'use strict';

  return EditFormPage.extend({

    pageClassName: 'page-max-flex',

    template,

    FormView,

    breadcrumbs()
    {
      if (this.model.id)
      {
        return EditFormPage.prototype.breadcrumbs.apply(this, arguments);
      }

      return createPageBreadcrumbs(this, [':addForm']);
    },

    initialize()
    {
      EditFormPage.prototype.initialize.apply(this, arguments);

      this.onResize = _.debounce(this.resize.bind(this), 16);

      $(window)
        .on(`resize.${this.idPrefix}`, this.onResize)
        .on(`scroll.${this.idPrefix}`, this.resize.bind(this));
    },

    destroy()
    {
      EditFormPage.prototype.destroy.apply(this, arguments);

      $(window).off(`.${this.idPrefix}`);
    },

    setUpLayout(layout)
    {
      if (this.model.id)
      {
        return;
      }

      this.listenTo(this.model, 'change:__v', (model, v) =>
      {
        if (v !== 1)
        {
          return;
        }

        layout.setBreadcrumbs(this.breadcrumbs, this);

        this.view.render();
        this.changesView.render();

        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl('edit'),
          trigger: false,
          replace: false
        });
      });
    },

    defineViews()
    {
      EditFormPage.prototype.defineViews.apply(this, arguments);

      this.changesView = new ChangesView({model: this.model});

      this.setView('#-form', this.view);
      this.setView('#-changes', this.changesView);
    },

    load(when)
    {
      return when(this.model.id ? this.model.fetch() : null);
    },

    afterRender()
    {
      EditFormPage.prototype.afterRender.apply(this, arguments);

      this.resize();
    },

    resize()
    {
      const formEl = this.$id('form')[0];

      if (!formEl)
      {
        return;
      }

      const rect = formEl.getBoundingClientRect();
      const top = Math.max(rect.top, 30);
      const left = rect.right + 30;
      const height = window.innerHeight - top - 30;
      const fixed = window.innerWidth >= 1600;

      this.$id('changes').toggleClass('fa-changes-fixed', fixed).find('.fa-changes').css({
        top: `${top}px`,
        left: `${left}px`,
        height: fixed ? `${height}px` : ''
      });

      this.changesView.scrollToBottom();
    }

  });
});
