import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { mapCollection } from "@src/utils/collection.util";
import { asc, collection, count, db } from "database";

const maxLimit = 100;

const route = createRoute({
  method: "get",
  path: "/collections",
  summary: "Get a list of collections.",
  request: {
    query: z.object({
      skip: z.string().optional().default("0").openapi({ description: "NFTs to skip" }),
      limit: z.string().optional().default(maxLimit.toString()).openapi({ description: "NFTs to return", maximum: maxLimit })
    })
  },
  responses: {
    200: {
      description: "List of collections",
      content: {
        "application/json": {
          schema: z.object({
            collections: z.array(
              z.object({
                address: z.string(),
                createdHeight: z.number(),
                name: z.string(),
                symbol: z.string(),
                mintContract: z.string().nullable(),
                marketContract: z.string().nullable(),
                minter: z.string(),
                creator: z.string(),
                description: z.string(),
                image: z.string(),
                externalLink: z.string(),
                royaltyAddress: z.string(),
                royaltyFee: z.string(),
                maxNumToken: z.number().nullable(),
                perAddressLimit: z.number().nullable(),
                startTime: z.string().nullable(),
                unitPrice: z.string().nullable(),
                unitDenom: z.string().nullable(),
                nftCount: z.number(),
                uniqueOwnerCount: z.number(),
                floorPrice: z.string().nullable(),
                totalSaleCount: z.number(),
                totalSaleVolume: z.object({
                  upasg: z.string().nullable(),
                  usd: z.string().nullable()
                }),
                saleCount24h: z.number(),
                saleCount24hChangePercentage: z.number(),
                saleVolume24h: z.object({
                  upasg: z.string().nullable(),
                  upasgChangePercentage: z.number().nullable(),
                  usd: z.string().nullable(),
                  usdChangePercentage: z.number().nullable()
                }),
                saleCount7d: z.number(),
                saleCount7dChangePercentage: z.number(),
                saleVolume7d: z.object({
                  upasg: z.string().nullable(),
                  upasgChangePercentage: z.number().nullable(),
                  usd: z.string().nullable(),
                  usdChangePercentage: z.number().nullable()
                }),
                saleCount30d: z.number(),
                saleCount30dChangePercentage: z.number(),
                saleVolume30d: z.object({
                  upasg: z.string().nullable(),
                  upasgChangePercentage: z.number().nullable(),
                  usd: z.string().nullable(),
                  usdChangePercentage: z.number().nullable()
                }),
                listedTokenCount: z.number()
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
  const skip = parseInt(c.req.valid("query").skip);
  const limit = Math.min(maxLimit, parseInt(c.req.valid("query").limit));

  const [{ count: totalCount }] = await db.select({ count: count() }).from(collection);

  const collections = await db.query.collection.findMany({
    offset: skip,
    limit: limit,
    orderBy: [asc(collection.createdHeight), asc(collection.address)]
  });

  const mappedCollections = await Promise.all(collections.map(mapCollection));

  return c.json({
    collections: mappedCollections,
    pagination: {
      total: totalCount
    }
  });
});
