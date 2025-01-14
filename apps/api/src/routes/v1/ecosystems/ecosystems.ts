import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { getEcosystems } from "@src/services/ecosystem.service";

const route = createRoute({
  method: "get",
  path: "/ecosystems",
  summary: "Get a list of ecosystems.",
  request: {},
  responses: {
    200: {
      description: "List of ecosystems",
      content: {
        "application/json": {
          schema: z.object({
            ecosystems: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
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
                    saleCount: z.number(),
                    saleVolume: z.object({
                      upasg: z.string().nullable(),
                      usd: z.string().nullable()
                    }),
                    saleCount24hAgo: z.number(),
                    saleVolume24hAgo: z.object({
                      upasg: z.string().nullable(),
                      usd: z.string().nullable()
                    }),
                    saleCount7dAgo: z.number(),
                    saleVolume7dAgo: z.object({
                      upasg: z.string().nullable(),
                      usd: z.string().nullable()
                    }),
                    saleCount30dAgo: z.number(),
                    saleVolume30dAgo: z.object({
                      upasg: z.string().nullable(),
                      usd: z.string().nullable()
                    }),
                    listedTokenCount: z.number()
                  })
                )
              })
            )
          })
        }
      }
    }
  }
});

export default new OpenAPIHono().openapi(route, async (c) => {
  const ecosystems = await getEcosystems();

  return c.json({
    ecosystems
  });
});
