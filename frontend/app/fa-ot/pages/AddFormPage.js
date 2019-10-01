// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  '../views/AddFormView'
], function(
  AddFormPage,
  AddFormView
) {
  'use strict';

  return AddFormPage.extend({

    pageClassName: 'page-max-flex',

    FormView: AddFormView

  });
});
