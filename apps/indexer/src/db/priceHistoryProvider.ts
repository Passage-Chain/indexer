import { isSameDay } from "date-fns";
import axios from "axios";
import { activeChain } from "@src/shared/constants";
import { db, day as dayTable, eq } from "database";

interface PriceHistoryResponse {
  prices: Array<Array<number>>;
  market_caps: Array<Array<number>>;
  total_volumes: Array<Array<number>>;
}

export const syncPriceHistory = async () => {
  if (!activeChain.coinGeckoId) {
    console.log("No coin gecko id defined for this chain. Skipping price history sync.");
    return;
  }

  const endpointUrl = `https://api.coingecko.com/api/v3/coins/${activeChain.coinGeckoId}/market_chart?vs_currency=usd&days=360`;

  console.log("Fetching latest market data from " + endpointUrl);

  const response = await axios.get<PriceHistoryResponse>(endpointUrl);

  const apiPrices = response.data.prices.map((pDate) => ({
    date: pDate[0],
    price: pDate[1]
  }));

  console.log(`There are ${apiPrices.length} prices to update.`);

  const days = await db.query.day.findMany();

  for (const day of days) {
    const priceData = apiPrices.find((x) => isSameDay(new Date(x.date), day.date));

    if (priceData && priceData.price != day.tokenPrice) {
      await db
        .update(dayTable)
        .set({
          tokenPrice: priceData.price,
          tokenPriceChanged: true
        })
        .where(eq(dayTable.id, day.id))
        .execute();
    }
  }
};
