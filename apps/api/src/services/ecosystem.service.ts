import { Ecosystem } from "@src/types";
import { mapCollection } from "@src/utils/collection.util";
import axios from "axios";
import { db, collection } from "database";

export async function getEcosystems() {
  const response = await axios.get<{ ecosystems: Ecosystem[] }>(
    "https://raw.githubusercontent.com/Passage-Chain/indexer/refs/heads/features/ecosystems/config/ecosystems.json"
  );
  const collections = await db.select().from(collection);
  const ecosystems = response.data.ecosystems.map((ecosystem) => ({
    ...ecosystem,
    collections: ecosystem.collections.map((collection) =>
      mapCollection(collections.find((c) => c.address === collection))
    ),
  }));

  return ecosystems;
}

export async function getEcosystem(id: string) {
  const ecosystems = await getEcosystems();
  return ecosystems.find((x) => x.id === id);
}
