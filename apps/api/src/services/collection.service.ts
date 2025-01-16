import { block, day, db, eq, nft, nftListing, nftSale, and, lte, min, sql, sum, count, countDistinct, gte, nftToTrait, nftTrait } from "database";
import { subHours, subDays } from "date-fns";
import { TraitStats, GetTraitsOptions } from "@src/types/collection";
import { udenomToDenom } from "@src/utils/math";

export async function getCollectionStats(collectionAddress: string) {
  const [
    nftCount,
    uniqueOwnerCount,
    floorPrice,
    { saleCount, saleVolume },
    { saleCount: saleCount24hAgo, saleVolume: saleVolume24hAgo },
    { saleCount: saleCount7dAgo, saleVolume: saleVolume7dAgo },
    { saleCount: saleCount30dAgo, saleVolume: saleVolume30dAgo },
    listedTokenCount
  ] = await Promise.all([
    getNftCount(collectionAddress),
    getUniqueOwnerCount(collectionAddress),
    getFloorPrice(collectionAddress),
    getSaleAndVolumeAtDate(collectionAddress),
    getSaleAndVolumeAtDate(collectionAddress, subHours(new Date(), 24)),
    getSaleAndVolumeAtDate(collectionAddress, subDays(new Date(), 7)),
    getSaleAndVolumeAtDate(collectionAddress, subDays(new Date(), 30)),
    getListedTokenCount(collectionAddress)
  ]);

  return {
    nftCount,
    uniqueOwnerCount,
    floorPrice,
    saleCount,
    saleVolume,
    saleCount24hAgo,
    saleVolume24hAgo,
    saleCount7dAgo,
    saleVolume7dAgo,
    saleCount30dAgo,
    saleVolume30dAgo,
    listedTokenCount
  };
}

async function getFloorPrice(collectionAddress: string) {
  const [{ floorPrice }] = await db
    .select({ floorPrice: min(nftListing.forSalePrice) })
    .from(nftListing)
    .innerJoin(nft, eq(nftListing.nft, nft.id))
    .where(eq(nft.collection, collectionAddress));

  return floorPrice;
}

async function getNftCount(collectionAddress: string) {
  const [{ nftCount }] = await db.select({ nftCount: count() }).from(nft).where(eq(nft.collection, collectionAddress));

  return nftCount;
}

async function getListedTokenCount(collectionAddress: string) {
  const [{ listedTokenCount }] = await db
    .select({ listedTokenCount: count() })
    .from(nftListing)
    .innerJoin(nft, eq(nftListing.nft, nft.id))
    .where(eq(nft.collection, collectionAddress));

  return listedTokenCount;
}

async function getUniqueOwnerCount(collectionAddress: string) {
  const [{ uniqueOwnerCount }] = await db
    .select({ uniqueOwnerCount: countDistinct(nft.owner) })
    .from(nft)
    .where(eq(nft.collection, collectionAddress));

  return uniqueOwnerCount;
}

async function getSaleAndVolumeAtDate(collectionAddress: string, date?: Date) {
  const [{ saleCount, saleVolumeUPasg, saleVolumeUSD }] = await db
    .select({ saleCount: count(), saleVolumeUPasg: sum(nftSale.salePrice), saleVolumeUSD: sum(sql`${nftSale.salePrice} * ${day.tokenPrice} / 1000000`) })
    .from(nftSale)
    .innerJoin(nft, eq(nftSale.nft, nft.id))
    .innerJoin(block, eq(nftSale.saleBlockHeight, block.height))
    .innerJoin(day, eq(block.dayId, day.id))
    .where(and(eq(nft.collection, collectionAddress), lte(block.datetime, date).if(date)));

  return { saleCount, saleVolume: { upasg: saleVolumeUPasg, usd: saleVolumeUSD } };
}

export async function getCollectionTraits(address: string, options: GetTraitsOptions): Promise<TraitStats[]> {
  debugger;
  const collection = await db.query.collection.findFirst({
    where: (table) => eq(table.address, address)
  });

  if (!collection) {
    throw new Error("Collection not found");
  }

  // Build date filters
  const dateFilters = [];
  if (options.startDate) {
    dateFilters.push(gte(block.datetime, new Date(options.startDate)));
  }
  if (options.endDate) {
    dateFilters.push(lte(block.datetime, new Date(options.endDate)));
  }

  // First, get all unique traits for the collection
  const nftsWithTraits = await db.query.nftTrait.findMany({
    where: (table) => and(eq(table.collection, address), options.traitType ? eq(table.traitType, options.traitType) : undefined),
    columns: {
      id: true,
      traitType: true,
      traitValue: true
    },
  });

  // Then, get sales data in a separate query
  const salesData = await db
    .select({
      traitId: nftTrait.id,
      salePrice: nftSale.salePrice,
      saleDenom: nftSale.saleDenom,
      datetime: block.datetime,
      tokenPrice: day.tokenPrice,
    })
    .from(nftSale)
    .innerJoin(nft, eq(nft.id, nftSale.nft))
    .innerJoin(nftToTrait, eq(nftToTrait.nftId, nft.id))
    .innerJoin(nftTrait, eq(nftTrait.id, nftToTrait.traitId))
    .innerJoin(block, eq(block.height, nftSale.saleBlockHeight))
    .innerJoin(day, eq(day.id, block.dayId))
    .where(
      and(
        eq(nftTrait.collection, address),
        options.traitType
          ? eq(nftTrait.traitType, options.traitType)
          : undefined,
        ...dateFilters
      )
    );

  // Create a map to store sales data by trait
  const traitSalesMap = new Map<
    string,
    {
      sales: {
        priceUsd: number;
        pricePasg: number;
        datetime: Date;
      }[];
      totalSales: number;
      volumeUsd: number;
      volumePasg: number;
      averagePriceUsd: number;
      averagePricePasg: number;
    }
  >();

  // Process sales data
  salesData.forEach((sale) => {
    const trait = nftsWithTraits.find((t) => t.id === sale.traitId);
    if (!trait) return;

    const key = `${trait.traitType}:${trait.traitValue}`;
    if (!traitSalesMap.has(key)) {
      traitSalesMap.set(key, {
        sales: [],
        totalSales: 0,
        volumeUsd: 0,
        volumePasg: 0,
        averagePriceUsd: 0,
        averagePricePasg: 0,
      });
    }

    const pricePasg = udenomToDenom(parseFloat(sale.salePrice));
    const priceUsd = calculateUsdPrice(sale.salePrice, sale.tokenPrice);

    if (priceUsd && pricePasg) {
      const data = traitSalesMap.get(key)!;
      data.sales.push({
        priceUsd,
        pricePasg,
        datetime: sale.datetime,
      });
      data.totalSales++;
      data.volumeUsd += priceUsd;
      data.volumePasg += pricePasg;
      data.averagePriceUsd = data.volumeUsd / data.totalSales;
      data.averagePricePasg = data.volumePasg / data.totalSales;
    }
  });

  // Create trait stats using the same key format
  const traitStats = new Map<string, TraitStats>();

  nftsWithTraits.forEach((trait) => {
    const key = `${trait.traitType}:${trait.traitValue}`;
    if (!traitStats.has(key)) {
      traitStats.set(key, {
        traitType: trait.traitType,
        traitValue: trait.traitValue,
        metrics: {
          totalSales: 0,
          volumeUsd: 0,
          volumePasg: 0,
          priceUsd: 0,
          pricePasg: 0,
          change24HourPercent: null,
          change7DayPercent: null,
          change30DayPercent: null
        }
      });
    }

    const stats = traitStats.get(key)!;
    const salesData = traitSalesMap.get(key);

    if (salesData) {
      const now = new Date();
      const sales = salesData.sales.sort(
        (a, b) => b.datetime.getTime() - a.datetime.getTime()
      );

      stats.metrics.totalSales = salesData.totalSales;
      stats.metrics.volumeUsd = salesData.volumeUsd;
      stats.metrics.volumePasg = salesData.volumePasg;
      stats.metrics.priceUsd = salesData.averagePriceUsd;
      stats.metrics.pricePasg = salesData.averagePricePasg;

      // Calculate percent changes
      stats.metrics.change24HourPercent = calculateVolumeChange(sales, now, 1);
      stats.metrics.change7DayPercent = calculateVolumeChange(sales, now, 7);
      stats.metrics.change30DayPercent = calculateVolumeChange(sales, now, 30);
    }
  });

  const results = Array.from(traitStats.values());
  return sortTraitStats(results, options.sortBy);
}

function sortTraitStats(stats: TraitStats[], sortBy?: "top" | "trending"): TraitStats[] {
  if (sortBy === "top") {
    return stats.sort((a, b) => b.metrics.volumeUsd - a.metrics.volumeUsd);
  } else if (sortBy === "trending") {
    return stats.sort((a, b) => b.metrics.totalSales - a.metrics.totalSales);
  }
  return stats;
}

function calculateUsdPrice(
  amount: string,
  tokenPrice: number | null
): number | null {
  if (!amount || !tokenPrice) {
    return null;
  }
  return (parseFloat(amount) * tokenPrice) / 1_000_000;
}

function calculateVolumeChange(
  sales: { priceUsd: number; datetime: Date }[],
  now: Date,
  days: number
): number | null {
  // Convert days to milliseconds
  const periodLength = days * 24 * 60 * 60 * 1000;

  // Calculate period boundaries
  const currentPeriodStart = new Date(now.getTime() - periodLength);
  const previousPeriodStart = new Date(
    currentPeriodStart.getTime() - periodLength
  );

  // Calculate current period volume (last X days)
  const currentPeriodVolume = sales
    .filter(
      (sale) => sale.datetime >= currentPeriodStart && sale.datetime <= now
    )
    .reduce((sum, sale) => sum + sale.priceUsd, 0);

  // Calculate previous period volume (X days before that)
  const previousPeriodVolume = sales
    .filter(
      (sale) =>
        sale.datetime >= previousPeriodStart &&
        sale.datetime < currentPeriodStart
    )
    .reduce((sum, sale) => sum + sale.priceUsd, 0);

  // If there were no sales in the previous period, return null
  if (previousPeriodVolume === 0) return null;

  // Calculate percent change
  const percentChange =
    ((currentPeriodVolume - previousPeriodVolume) / previousPeriodVolume) * 100;
  return Math.round(percentChange * 100) / 100; // Round to 2 decimal places
}
