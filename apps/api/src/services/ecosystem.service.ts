import axios from "axios";
import { Ecosystem } from "@src/types";
import { mapCollection } from "@src/utils/collection.util";
import { db, collection, inArray } from "database";

export async function getEcosystems() {
  const response = await axios.get<{ ecosystems: Ecosystem[] }>("https://raw.githubusercontent.com/Passage-Chain/indexer/main/config/ecosystems.json");

  const collectionIds = response.data.ecosystems.flatMap((ecosystem) => ecosystem.collections);

  const collections = await db.select().from(collection).where(inArray(collection.address, collectionIds));
  const mappedCollections = await Promise.all(collections.map(mapCollection));

  const ecosystems = response.data.ecosystems.map((ecosystem) => ({
    ...ecosystem,
    collections: ecosystem.collections.map((collection) => mappedCollections.find((c) => c.address === collection)).filter((c) => c)
  }));

  return ecosystems;
}

export async function getEcosystem(id: string) {
  const ecosystems = await getEcosystems();
  return ecosystems.find((x) => x.id === id);
}
