// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  './ProtocolStageView',
  './VerifyStageView',
  './AcceptOwnerStageView',
  './AcceptDepartmentStageView',
  './AcceptFinanceStageView',
  './RecordStageView',
  './FinishedStageView'
], function(
  ProtocolStageView,
  VerifyStageView,
  AcceptOwnerStageView,
  AcceptDepartmentStageView,
  AcceptFinanceStageView,
  RecordStageView,
  FinishedStageView
) {
  'use strict';

  return {
    protocol: ProtocolStageView,
    verify: VerifyStageView,
    acceptOwner: AcceptOwnerStageView,
    acceptDepartment: AcceptDepartmentStageView,
    acceptFinance: AcceptFinanceStageView,
    record: RecordStageView,
    finished: FinishedStageView
  };
});
