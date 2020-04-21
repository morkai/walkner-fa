// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/core/util/html2pdf',
  'app/fa-common/views/ChangesView',
  '../views/DetailsView',
  'app/fa-lt/templates/detailsPage',
  'app/fa-lt/templates/documentPrint'
], function(
  DetailsPage,
  html2pdf,
  ChangesView,
  DetailsView,
  template,
  documentPrintTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template: template,

    pageId: 'fa-details',

    pageClassName: 'page-max-flex',

    DetailsView: DetailsView,

    actions: function()
    {
      var actions = DetailsPage.prototype.actions.apply(this, arguments);

      if (this.model.get('stage') !== 'cancelled')
      {
        actions.unshift({
          icon: 'print',
          label: this.t('PAGE_ACTION:printDocument'),
          callback: this.printDocument.bind(this)
        });
      }

      return actions;
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change', this.onModelChange);
      });
    },

    defineViews: function()
    {
      DetailsPage.prototype.defineViews.apply(this, arguments);

      this.changesView = new ChangesView({model: this.model});

      this.setView('#-props', this.view);
      this.setView('#-changes', this.changesView);
    },

    printDocument: function()
    {
      html2pdf(this.renderPartialHtml(documentPrintTemplate, {
        model: this.model.toJSON(),
        details: this.model.serializeDetails(),
        comments: this.model.serializeComments()
      }));
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    onModelChange: function()
    {
      if (this.layout)
      {
        this.layout.setActions(this.actions, this);
      }
    }

  });
});
