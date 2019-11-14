// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  './ProtocolStageView',
  './VerifyStageView',
  './AcceptOwnerStageView',
  './AcceptCommitteeStageView',
  './AcceptFinanceStageView',
  './AcceptDepartmentStageView',
  './AcceptDocumentStageView',
  './RecordStageView',
  './FinishedStageView'
], function(
  ProtocolStageView,
  VerifyStageView,
  AcceptOwnerStageView,
  AcceptCommitteeStageView,
  AcceptFinanceStageView,
  AcceptDepartmentStageView,
  AcceptDocumentStageView,
  RecordStageView,
  FinishedStageView
) {
  'use strict';

  return {
    protocol: ProtocolStageView,
    verify: VerifyStageView,
    acceptOwner: AcceptOwnerStageView,
    acceptCommittee: AcceptCommitteeStageView,
    acceptFinance: AcceptFinanceStageView,
    acceptDepartment: AcceptDepartmentStageView,
    acceptDocument: AcceptDocumentStageView,
    record: RecordStageView,
    finished: FinishedStageView
  };
});
