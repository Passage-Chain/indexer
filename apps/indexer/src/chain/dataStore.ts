import { Level } from "level";
import fs from "fs";
import { bytesToHumanReadableSize } from "@src/shared/utils/files";
import { dataFolderPath } from "@src/shared/constants";
import { BlockResultType, BlockType } from "@src/shared/types";

const path = require("path");

const LevelNotFoundCode = "LEVEL_NOT_FOUND";

if (!fs.existsSync(dataFolderPath)) {
  fs.mkdirSync(dataFolderPath, { recursive: true });
}

export const blockHeightToKey = (height: number) => height.toString().padStart(10, "0");

export const blocksDb = new Level(dataFolderPath + "/blocks.db");
export const blockResultsDb = new Level(dataFolderPath + "/blockResults.db");

export async function getLatestHeightInCache() {
  const reverseKeyIterator = blocksDb.keys({ reverse: true });
  const keyStr = await reverseKeyIterator.next();
  await reverseKeyIterator.close();

  if (keyStr) {
    return parseInt(keyStr);
  } else {
    return 0;
  }
}

export const getCacheSize = async function () {
  console.time("size");
  const blocksSize = await getTotalSize(dataFolderPath + "/blocks.db");
  const blockResultsSize = await getTotalSize(dataFolderPath + "/blockResults.db");
  console.timeEnd("size");
  return { blocksSize: blocksSize, blockResultsSize: blockResultsSize };
};

export const deleteCache = async function () {
  console.log("Deleting cache...");
  await blocksDb.clear();
  await blockResultsDb.clear();
  console.log("Deleted");
};

export async function getCachedBlockByHeight(height: number) {
  try {
    const content = await blocksDb.get(blockHeightToKey(height));
    return JSON.parse(content) as BlockType;
  } catch (err) {
    if (err.code !== LevelNotFoundCode) throw err;

    return null;
  }
}

export async function getCachedBlockResultsByHeight(height: number) {
  try {
    const content = await blockResultsDb.get(blockHeightToKey(height));
    return JSON.parse(content) as BlockResultType;
  } catch (err) {
    if (err.code !== LevelNotFoundCode) throw err;

    return null;
  }
}

async function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = await fs.promises.readdir(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  for (const file of files) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = await getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  }

  return arrayOfFiles;
}

async function getTotalSize(directoryPath: string) {
  const arrayOfFiles = await getAllFiles(directoryPath);

  let totalSize = 0;

  arrayOfFiles.forEach((filePath) => {
    totalSize += fs.statSync(filePath).size;
  });

  return bytesToHumanReadableSize(totalSize);
}
