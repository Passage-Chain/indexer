import { block, day, db, eq, nft, nftListing, nftSale, and, lte, min, sql, sum, count, countDistinct } from "database";
import { subHours, subDays } from "date-fns";

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
