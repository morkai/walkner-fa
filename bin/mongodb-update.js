/* eslint-disable no-var,quotes,curly */
/* global ObjectId,db,print */

'use strict';

db.faots.dropIndexes();

const assetProps = [
  'inventoryNo',
  'serialNo',
  'assetName',
  'assetNameSearch',
  'lineSymbol',
  'owner',
  'supplier',
  'supplierSearch',
  'costCenter',
  'evalGroup1',
  'evalGroup5',
  'assetClass',
  'depRate',
  'depKey',
  'economicMethod',
  'fiscalMethod',
  'taxMethod',
  'economicPeriod',
  'fiscalPeriod',
  'taxPeriod',
  'economicDate',
  'fiscalDate',
  'taxDate',
  'value',
  'transactions',
  'vendorNo',
  'vendorName',
  'vendorNameSearch',
  'assetNo',
  'accountingNo',
  'odwNo',
  'tplNotes',
  'photoFile'
];

let i = 0;

db.faots.find({assets: {$exists: false}}).forEach(doc =>
{
  i += 1;

  const asset = {
    _id: `${i.toString().padStart(8, '0')}-0000-0000-0000-000000000001`
  };

  assetProps.forEach(prop =>
  {
    asset[prop] = doc[prop];
    delete doc[prop];
  });

  doc.assets = [asset];

  db.faots.replaceOne({_id: doc._id}, doc);
});

db.faots.createIndex({createdAt: -1});
db.faots.createIndex({updatedAt: -1});
db.faots.createIndex({date: -1});
db.faots.createIndex({stage: 1});
db.faots.createIndex({protocolNo: 1});
db.faots.createIndex({documentNo: 1});
db.faots.createIndex({commissioningType: 1});
db.faots.createIndex({users: 1});
db.faots.createIndex({'assets.inventoryNo': 1});
db.faots.createIndex({'assets.assetNo': 1});
db.faots.createIndex({'assets.accountingNo': 1});
db.faots.createIndex({'assets.costCenter': 1});
db.faots.createIndex({'assets.vendorNo': 1});
db.faots.createIndex({'assets.assetName': 1});
db.faots.createIndex({'assets.supplier': 1});
db.faots.createIndex({'assets.vendorName': 1});
