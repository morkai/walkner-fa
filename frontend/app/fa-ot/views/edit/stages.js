// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  './ProtocolStageView',
  './AuthorizeStageView',
  './DocumentStageView',
  './VerifyStageView',
  './AcceptStageView',
  './RecordStageView',
  './FinishedStageView'
], function(
  ProtocolStageView,
  AuthorizeStageView,
  DocumentStageView,
  VerifyStageView,
  AcceptStageView,
  RecordStageView,
  FinishedStageView
) {
  'use strict';

  return {
    protocol: ProtocolStageView,
    authorize: AuthorizeStageView,
    document: DocumentStageView,
    verify: VerifyStageView,
    accept: AcceptStageView,
    record: RecordStageView,
    finished: FinishedStageView
  };
});
