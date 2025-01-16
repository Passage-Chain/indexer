import { block, day, db, eq, nft, nftListing, nftSale, and, lte, min, sql, sum, count, countDistinct, gte } from "database";
import { subHours, subDays } from "date-fns";
import { TraitStats, GetTraitsOptions } from "@src/types/collection";

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

  const nftsWithTraits = await db.query.nftTrait.findMany({
    where: (table) => and(eq(table.collection, address), options.traitType ? eq(table.traitType, options.traitType) : undefined),
    columns: {
      traitType: true,
      traitValue: true
    },
    with: {
      nftToTraits: {
        with: {
          nft: {
            with: {
              sales: {
                with: {
                  block: {
                    columns: {
                      datetime: true
                    },
                    with: {
                      day: true
                    }
                  }
                },
                where: and(...dateFilters)
              }
            }
          }
        }
      }
    }
  });

  debugger;

  const traitStats = new Map<string, TraitStats>();

  nftsWithTraits.forEach((trait) => {
    const key = `${trait.traitType}:${trait.traitValue}`;
    if (!traitStats.has(key)) {
      traitStats.set(key, {
        traitType: trait.traitType,
        traitValue: trait.traitValue,
        metrics: {
          totalSales: 0,
          volume: 0,
          price: 0,
          change24HourPercent: null,
          change7DayPercent: null,
          change30DayPercent: null
        }
      });
    }

    const stats = traitStats.get(key)!;
    const sales = trait.nftToTraits.flatMap((ntt) => ntt.nft.sales);

    stats.metrics.totalSales += sales.length;
    sales.forEach((sale) => {
      const usdPrice = calculateUsdPrice(sale.salePrice, sale.saleDenom, sale.block?.day?.tokenPrice);
      if (usdPrice) {
        stats.metrics.volume += usdPrice;
      }
    });

    if (stats.metrics.totalSales > 0) {
      stats.metrics.price = stats.metrics.volume / stats.metrics.totalSales;
    }
  });

  const results = Array.from(traitStats.values());
  return sortTraitStats(results, options.sortBy);
}

function sortTraitStats(stats: TraitStats[], sortBy?: "top" | "trending"): TraitStats[] {
  if (sortBy === "top") {
    return stats.sort((a, b) => b.metrics.volume - a.metrics.volume);
  } else if (sortBy === "trending") {
    return stats.sort((a, b) => b.metrics.totalSales - a.metrics.totalSales);
  }
  return stats;
}

function calculateUsdPrice(amount: string, denom: string, tokenPrice: number | null): number | null {
  if (!amount || !tokenPrice) {
    return null;
  }
  return (parseFloat(amount) * tokenPrice) / 1_000_000;
}
