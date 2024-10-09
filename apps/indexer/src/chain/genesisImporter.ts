import fs from "fs";
import { download } from "@src/shared/utils/download";
import { IGenesis } from "./genesisTypes";
import { activeChain, dataFolderPath } from "@src/shared/constants";
import path from "path";
import { ungzip } from "node-gzip";

export async function getGenesis(): Promise<IGenesis> {
  if (!activeChain.genesisFileUrl) throw new Error("Genesis file URL not found in active chain configuration");

  const ext = path.extname(activeChain.genesisFileUrl);
  const filename = path.basename(activeChain.genesisFileUrl);

  let genesisLocalPath = dataFolderPath + "/" + filename;

  if (!fs.existsSync(genesisLocalPath)) {
    console.log("Downloading genesis file: " + activeChain.genesisFileUrl);
    await download(activeChain.genesisFileUrl, genesisLocalPath);
  }

  if (ext === ".gz") {
    console.log("Extracting genesis file...");
    const decompressed = await ungzip(fs.readFileSync(genesisLocalPath).buffer);
    genesisLocalPath = genesisLocalPath.replace(".gz", "");
    fs.writeFileSync(genesisLocalPath, decompressed);
  }

  const fileContent = await fs.promises.readFile(genesisLocalPath, { encoding: "utf-8" });
  return JSON.parse(fileContent) as IGenesis;
}
