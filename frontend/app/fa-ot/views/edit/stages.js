// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  './ProtocolStageView',
  './DocumentStageView',
  './VerifyStageView',
  './AcceptStageView',
  './RecordStageView',
  './FinishedStageView'
], function(
  ProtocolStageView,
  DocumentStageView,
  VerifyStageView,
  AcceptStageView,
  RecordStageView,
  FinishedStageView
) {
  'use strict';

  return {
    protocol: ProtocolStageView,
    document: DocumentStageView,
    verify: VerifyStageView,
    accept: AcceptStageView,
    record: RecordStageView,
    finished: FinishedStageView
  };
});
