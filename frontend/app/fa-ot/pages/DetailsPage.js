// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/core/util/html2pdf',
  'app/fa-common/views/ChangesView',
  '../views/DetailsView',
  'app/fa-ot/templates/detailsPage',
  'app/fa-ot/templates/documentPrint',
  'app/fa-ot/templates/protocolPrint'
], function(
  DetailsPage,
  html2pdf,
  ChangesView,
  DetailsView,
  template,
  documentPrintTemplate,
  protocolPrintTemplate
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

      if (this.model.get('protocolNeeded'))
      {
        actions.unshift({
          icon: 'print',
          label: this.t('PAGE_ACTION:printProtocol'),
          callback: this.printProtocol.bind(this)
        });
      }

      actions.unshift({
        icon: 'print',
        label: this.t('PAGE_ACTION:printDocument'),
        callback: this.printDocument.bind(this)
      });

      return actions;
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

    printProtocol: function()
    {
      html2pdf(this.renderPartialHtml(protocolPrintTemplate, {
        model: this.model.toJSON(),
        details: this.model.serializeDetails()
      }));
    }

  });
});
