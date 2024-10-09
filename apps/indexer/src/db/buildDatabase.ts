import { activeChain } from "@src/shared/constants";
import { indexers } from "@src/indexers";
import { getGenesis } from "@src/chain/genesisImporter";
import { db } from "database";

/**
 * Initiate database schema
 */
export const initDatabase = async () => {
  // TODO: Run Migrations

  // If we are syncing from the first block and this is the first time syncing, seed the database with the genesis file
  if (activeChain.genesisFileUrl) {
    const firstBlock = await db.query.block.findFirst();
    if (!firstBlock) {
      console.log("First time syncing, seeding from genesis file...");

      const genesis = await getGenesis();
      for (const indexer of indexers) {
        await indexer.seed(genesis);
      }
    }
  }
};
