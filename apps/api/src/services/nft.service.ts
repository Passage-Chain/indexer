import { and, asc, block as blockTable, day as dayTable, db, eq, isNull, nftBid, nftListing, nftSale } from "database";

export async function getNftActiveListings(nftId: string) {
  const listings = await db
    .select()
    .from(nftListing)
    .leftJoin(blockTable, eq(nftListing.forSaleBlockHeight, blockTable.height))
    .innerJoin(dayTable, eq(blockTable.dayId, dayTable.id))
    .where(and(eq(nftListing.nft, nftId), isNull(nftListing.unlistedBlockHeight)))
    .orderBy(asc(nftListing.forSaleBlockHeight));

  return listings.map((x) => ({
    ...x.nft_listing,
    block: { ...x.block, day: x.day }
  }));
}

export async function getNftBids(nftId: string) {
  const bids = await db
    .select()
    .from(nftBid)
    .leftJoin(blockTable, eq(nftBid.bidBlockHeight, blockTable.height))
    .innerJoin(dayTable, eq(blockTable.dayId, dayTable.id))
    .where(eq(nftBid.nft, nftId))
    .orderBy(asc(nftBid.bidBlockHeight));

  return bids.map((x) => ({
    ...x.nft_bid,
    block: { ...x.block, day: x.day }
  }));
}

export async function getNftSales(nftId: string) {
  const sales = await db
    .select()
    .from(nftSale)
    .leftJoin(blockTable, eq(nftSale.saleBlockHeight, blockTable.height))
    .innerJoin(dayTable, eq(blockTable.dayId, dayTable.id))
    .where(eq(nftSale.nft, nftId))
    .orderBy(asc(nftSale.saleBlockHeight));

  return sales.map((x) => ({
    ...x.nft_sale,
    block: { ...x.block, day: x.day }
  }));
}
