import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { asc, Collection, collection, count, db } from "database";

const maxLimit = 100;

const route = createRoute({
  method: "get",
  path: "/collections",
  summary: "Get a list of collections.",
  request: {
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
    }),
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
                startTime: z.string(),
                unitPrice: z.number().nullable(),
                unitDenom: z.string().nullable(),
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
  const skip = parseInt(c.req.valid("query").skip);
  const limit = Math.min(maxLimit, parseInt(c.req.valid("query").limit));

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(collection);

  const collections = await db.query.collection.findMany({
    offset: skip,
    limit: limit,
    orderBy: [asc(collection.createdHeight), asc(collection.address)],
  });

  return c.json({
    collections: collections.map((c) => ({
      address: c.address,
      createdHeight: c.createdHeight,
      name: c.name,
      symbol: c.symbol,
      mintContract: c.mintContract,
      marketContract: c.marketContract,
      minter: c.minter,
      creator: c.creator,
      description: c.description,
      image: c.image,
      externalLink: c.externalLink,
      royaltyAddress: c.royaltyAddress,
      royaltyFee: c.royaltyFee,
      maxNumToken: c.maxNumToken,
      perAddressLimit: c.perAddressLimit,
      startTime: c.startTime,
      unitPrice: c.unitPrice,
      unitDenom: c.unitDenom,
    })),
    pagination: {
      total: totalCount,
    },
  });
});
