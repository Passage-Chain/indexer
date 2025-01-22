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
