import { Ecosystem } from "@src/types";
import axios from "axios";
import { db, collection } from "database";

export async function getEcosystems() {
  const response = await axios.get<Ecosystem[]>(
    "https://raw.githubusercontent.com/Passage-Chain/indexer/refs/heads/features/ecosystems/config/ecosystems.json"
  );
  const collections = await db.select().from(collection);
  const ecosystems = response.data.map((ecosystem) => ({
    ...ecosystem,
    collections: ecosystem.collections.map((collection) =>
      collections.find((c) => c.address === collection)
    ),
  }));

  return ecosystems;
}

export async function getEcosystem(id: string) {
  const ecosystems = await getEcosystems();
  return ecosystems.find((x) => x.id === id);
}
