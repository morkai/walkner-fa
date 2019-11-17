// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  './ProtocolStageView',
  './AcceptCommitteeStageView',
  './VerifyStageView',
  './AcceptOwnerStageView',
  './AcceptFinanceStageView',
  './AcceptDepartmentStageView',
  './AcceptDocumentStageView',
  './RecordStageView',
  './FinishedStageView'
], function(
  ProtocolStageView,
  AcceptCommitteeStageView,
  VerifyStageView,
  AcceptOwnerStageView,
  AcceptFinanceStageView,
  AcceptDepartmentStageView,
  AcceptDocumentStageView,
  RecordStageView,
  FinishedStageView
) {
  'use strict';

  return {
    protocol: ProtocolStageView,
    acceptCommittee: AcceptCommitteeStageView,
    verify: VerifyStageView,
    acceptOwner: AcceptOwnerStageView,
    acceptFinance: AcceptFinanceStageView,
    acceptDepartment: AcceptDepartmentStageView,
    acceptDocument: AcceptDocumentStageView,
    record: RecordStageView,
    finished: FinishedStageView
  };
});
