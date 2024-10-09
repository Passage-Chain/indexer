import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { OpenAPI_ExampleCollection } from "@src/utils/constants";
import { db, eq } from "database";

const route = createRoute({
  method: "get",
  path: "/collections/{address}",
  summary: "Get a collection by address.",
  request: {
    params: z.object({
      address: z.string().openapi({
        description: "Collection Address",
        example: OpenAPI_ExampleCollection,
      }),
    }),
  },
  responses: {
    404: { description: "Collection not found" },
    200: {
      description: "Collection details",
      content: {
        "application/json": {
          schema: z.object({
            address: z.string(),
            createdHeight: z.number(),
            name: z.string(),
            symbol: z.string(),
            mintContract: z.string().nullable(),
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
          }),
        },
      },
    },
  },
});

export default new OpenAPIHono().openapi(route, async (c) => {
  const collectionAddress = c.req.valid("param").address;

  const collection = await db.query.collection.findFirst({
    where: (table) => eq(table.address, collectionAddress),
  });

  if (!collection) {
    return c.text("Collection not found", 404);
  }

  return c.json({
    address: collection.address,
    createdHeight: collection.createdHeight,
    name: collection.name,
    symbol: collection.symbol,
    mintContract: collection.mintContract,
    minter: collection.minter,
    creator: collection.creator,
    description: collection.description,
    image: collection.image,
    externalLink: collection.externalLink,
    royaltyAddress: collection.royaltyAddress,
    royaltyFee: collection.royaltyFee,
    maxNumToken: collection.maxNumToken,
    perAddressLimit: collection.perAddressLimit,
    startTime: collection.startTime,
    unitPrice: collection.unitPrice,
    unitDenom: collection.unitDenom,
  });
});
