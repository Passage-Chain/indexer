import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { OpenAPI_ExampleOwner } from "@src/utils/constants";
import { count, db, eq, asc, nft, nftListing, collection } from "database";

const maxLimit = 100;

const route = createRoute({
  method: "get",
  path: "/accounts/{address}/nfts",
  summary: "Get a list of NFTs owned by an account.",
  request: {
    params: z.object({
      address: z.string().openapi({
        description: "Account Address",
        example: OpenAPI_ExampleOwner
      })
    }),
    query: z.object({
      skip: z.string().optional().default("0").openapi({ description: "NFTs to skip" }),
      limit: z.string().optional().default(maxLimit.toString()).openapi({ description: "NFTs to return", maximum: maxLimit })
    })
  },
  responses: {
    200: {
      description: "List of nfts",
      content: {
        "application/json": {
          schema: z.object({
            nfts: z.array(
              z.object({
                tokenId: z.number(),
                owner: z.string(),
                collection: z.object({
                  address: z.string(),
                  name: z.string()
                }),
                metadata: z.unknown({ description: "JSON Metadata" }),
                createdOnBlockHeight: z.number(),
                mintedOnBlockHeight: z.number(),
                mintPrice: z.string(),
                mintDenom: z.string(),
                listedPrice: z.string().nullable(),
                listedDenom: z.string().nullable()
              })
            ),
            pagination: z.object({
              total: z.number()
            })
          })
        }
      }
    }
  }
});

export default new OpenAPIHono().openapi(route, async (c) => {
  const accountAddress = c.req.valid("param").address;
  const skip = parseInt(c.req.valid("query").skip);
  const limit = Math.min(maxLimit, parseInt(c.req.valid("query").limit));

  const [{ count: totalCount }] = await db.select({ count: count() }).from(nft).where(eq(nft.owner, accountAddress));

  const nfts = await db
    .select()
    .from(nft)
    .where(eq(nft.owner, accountAddress))
    .leftJoin(nftListing, eq(nftListing.id, nft.activeListingId))
    .innerJoin(collection, eq(collection.address, nft.collection))
    .offset(skip)
    .limit(limit)
    .orderBy(asc(nft.tokenId));

  return c.json({
    nfts: nfts.map(({ nft, nft_listing: activeListing, collection }) => ({
      tokenId: nft.tokenId,
      owner: nft.owner,
      collection: {
        address: nft.collection,
        name: collection.name
      },
      metadata: nft.metadata,
      createdOnBlockHeight: nft.createdOnBlockHeight,
      mintedOnBlockHeight: nft.mintedOnBlockHeight,
      mintPrice: nft.mintPrice,
      mintDenom: nft.mintDenom,
      listedPrice: activeListing?.forSalePrice || null,
      listedDenom: activeListing?.forSaleDenom || null
    })),
    pagination: {
      total: totalCount
    }
  });
});
