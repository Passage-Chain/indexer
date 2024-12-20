import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { OpenAPI_ExampleCollection } from "@src/utils/constants";
import {
  and,
  asc,
  count,
  db,
  desc,
  eq,
  isNotNull,
  nft,
  nftListing,
} from "database";

const maxLimit = 100;

const sortOptions = {
  priceAsc: asc(nftListing.forSalePrice),
  priceDesc: desc(nftListing.forSalePrice),
};

const route = createRoute({
  method: "get",
  path: "/collections/{address}/nfts",
  summary: "Get a list of NFTs in a collection.",
  request: {
    params: z.object({
      address: z.string().openapi({
        description: "Collection Address",
        example: OpenAPI_ExampleCollection,
      }),
    }),
    query: z.object({
      skip: z
        .string()
        .optional()
        .default("0")
        .openapi({ description: "NFTs to skip" }),
      limit: z
        .string()
        .optional()
        .default(maxLimit.toString())
        .openapi({ description: "NFTs to return", maximum: maxLimit }),
      forSale: z
        .string()
        .optional()
        .openapi({
          description: "Only show NFTs for sale",
          enum: ["true", "false"],
        }),
      sort: z
        .string()
        .optional()
        .openapi({
          description: "Sort order",
          enum: Object.keys(sortOptions),
        }),
    }),
  },
  responses: {
    200: {
      description: "List of nfts",
      content: {
        "application/json": {
          schema: z.object({
            nfts: z.array(
              z.object({
                tokenId: z.string(),
                owner: z.string(),
                metadata: z.unknown({ description: "JSON Metadata" }),
                createdOnBlockHeight: z.number(),
                mintedOnBlockHeight: z.number(),
                mintPrice: z.number(),
                mintDenom: z.string(),
                listedPrice: z.number().nullable(),
                listedDenom: z.string().nullable(),
              })
            ),
            pagination: z.object({
              total: z.number(),
            }),
          }),
        },
      },
    },
  },
});

export default new OpenAPIHono().openapi(route, async (c) => {
  const collectionAddress = c.req.valid("param").address;
  const skip = parseInt(c.req.valid("query").skip);
  const limit = Math.min(maxLimit, parseInt(c.req.valid("query").limit));
  const forSale = c.req.valid("query").forSale === "true";
  const sort = sortOptions[c.req.valid("query").sort] || asc(nft.tokenId);

  const collection = await db.query.collection.findFirst({
    where: (table) => eq(table.address, collectionAddress),
  });

  if (!collection) {
    return c.text("Collection not found", 404);
  }

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(nft)
    .where(
      and(
        eq(nft.collection, collectionAddress),
        isNotNull(nft.activeListingId).if(forSale)
      )
    );

  const nfts = await db
    .select()
    .from(nft)
    .where(
      and(
        eq(nft.collection, collectionAddress),
        isNotNull(nft.activeListingId).if(forSale)
      )
    )
    .leftJoin(nftListing, eq(nftListing.id, nft.activeListingId))
    .offset(skip)
    .limit(limit)
    .orderBy(sort);

  return c.json({
    nfts: nfts.map(({ nft, nft_listing: activeListing }) => ({
      tokenId: nft.tokenId,
      owner: nft.owner,
      metadata: nft.metadata,
      createdOnBlockHeight: nft.createdOnBlockHeight,
      mintedOnBlockHeight: nft.mintedOnBlockHeight,
      mintPrice: nft.mintPrice,
      mintDenom: nft.mintDenom,
      listedPrice: activeListing?.forSalePrice || null,
      listedDenom: activeListing?.forSaleDenom || null,
    })),
    pagination: {
      total: totalCount,
    },
  });
});
