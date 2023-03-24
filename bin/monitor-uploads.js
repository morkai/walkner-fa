'use strict';

const moment = require('moment');
const fs = require('fs-extra');

const UPLOADS_DIR_PATH = `${__dirname}/../data/uploads/fa`;
const FILES_FILE_PATH = `${__filename}on`;

main();

function main()
{
  const newFiles = fs.readdirSync(UPLOADS_DIR_PATH);

  if (fs.pathExistsSync(FILES_FILE_PATH))
  {
    const oldFiles = require(FILES_FILE_PATH);

    compareFiles(oldFiles, newFiles);
  }

  fs.writeFileSync(FILES_FILE_PATH, JSON.stringify(newFiles));
}

function compareFiles(oldFileList, newFileList)
{
  const oldFileSet = new Set();
  const newFileSet = new Set();
  const time = moment().format('YYYY-MM-DD HH:mm:ss');

  oldFileList.forEach(file => oldFileSet.add(file));
  newFileList.forEach(file => newFileSet.add(file));

  newFileSet.forEach(file =>
  {
    if (oldFileSet.has(file))
    {
      oldFileSet.delete(file);
    }
    else
    {
      console.log(`${time} add ${file}`);
    }
  });

  oldFileSet.forEach(file =>
  {
    console.log(`${time} del ${file}`);
  });
}
