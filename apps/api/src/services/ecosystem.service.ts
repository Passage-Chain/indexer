import { Ecosystem } from "@src/types";
import axios from "axios";

export async function getEcosystems() {
  const ecosystems = await axios.get<Ecosystem>(
    "https://raw.githubusercontent.com/Passage-Chain/indexer/refs/heads/features/ecosystems/config/ecosystems.json"
  );
  return ecosystems;
}
