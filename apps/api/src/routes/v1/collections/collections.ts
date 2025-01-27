import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { mapCollection } from "@src/utils/collection.util";
import { asc, collection, db } from "database";

const maxLimit = 100;

type MappedCollectionType = Awaited<ReturnType<typeof mapCollection>>;
const sortOptions: Record<string, (a: MappedCollectionType, b: MappedCollectionType) => number> = {
  createdHeightAsc: (a, b) => a.createdHeight - b.createdHeight,
  createdHeightDesc: (a, b) => b.createdHeight - a.createdHeight,
  nftCountAsc: (a, b) => a.nftCount - b.nftCount,
  nftCountDesc: (a, b) => b.nftCount - a.nftCount,
  uniqueOwnerCountAsc: (a, b) => a.uniqueOwnerCount - b.uniqueOwnerCount,
  uniqueOwnerCountDesc: (a, b) => b.uniqueOwnerCount - a.uniqueOwnerCount,
  floorPriceAsc: (a, b) => parseFloat(a.floorPrice || "0") - parseFloat(b.floorPrice || "0"),
  floorPriceDesc: (a, b) => parseFloat(b.floorPrice || "0") - parseFloat(a.floorPrice || "0"),
  totalSaleCountAsc: (a, b) => a.totalSaleCount - b.totalSaleCount,
  totalSaleCountDesc: (a, b) => b.totalSaleCount - a.totalSaleCount,
  totalSaleVolumeUpasgAsc: (a, b) => parseFloat(a.totalSaleVolume.upasg || "0") - parseFloat(b.totalSaleVolume.upasg || "0"),
  totalSaleVolumeUpasgDesc: (a, b) => parseFloat(b.totalSaleVolume.upasg || "0") - parseFloat(a.totalSaleVolume.upasg || "0"),
  totalSaleVolumeUsdAsc: (a, b) => parseFloat(a.totalSaleVolume.usd || "0") - parseFloat(b.totalSaleVolume.usd || "0"),
  totalSaleVolumeUsdDesc: (a, b) => parseFloat(b.totalSaleVolume.usd || "0") - parseFloat(a.totalSaleVolume.usd || "0"),
  saleCount24hAsc: (a, b) => a.saleCount24h - b.saleCount24h,
  saleCount24hDesc: (a, b) => b.saleCount24h - a.saleCount24h,
  saleVolume24hUpasgAsc: (a, b) => parseFloat(a.saleVolume24h.upasg || "0") - parseFloat(b.saleVolume24h.upasg || "0"),
  saleVolume24hUpasgDesc: (a, b) => parseFloat(b.saleVolume24h.upasg || "0") - parseFloat(a.saleVolume24h.upasg || "0"),
  saleVolume24hUsdAsc: (a, b) => parseFloat(a.saleVolume24h.usd || "0") - parseFloat(b.saleVolume24h.usd || "0"),
  saleVolume24hUsdDesc: (a, b) => parseFloat(b.saleVolume24h.usd || "0") - parseFloat(a.saleVolume24h.usd || "0"),
  saleCount7dAsc: (a, b) => a.saleCount7d - b.saleCount7d,
  saleCount7dDesc: (a, b) => b.saleCount7d - a.saleCount7d,
  saleVolume7dUpasgAsc: (a, b) => parseFloat(a.saleVolume7d.upasg || "0") - parseFloat(b.saleVolume7d.upasg || "0"),
  saleVolume7dUpasgDesc: (a, b) => parseFloat(b.saleVolume7d.upasg || "0") - parseFloat(a.saleVolume7d.upasg || "0"),
  saleVolume7dUsdAsc: (a, b) => parseFloat(a.saleVolume7d.usd || "0") - parseFloat(b.saleVolume7d.usd || "0"),
  saleVolume7dUsdDesc: (a, b) => parseFloat(b.saleVolume7d.usd || "0") - parseFloat(a.saleVolume7d.usd || "0"),
  saleCount30dAsc: (a, b) => a.saleCount30d - b.saleCount30d,
  saleCount30dDesc: (a, b) => b.saleCount30d - a.saleCount30d,
  saleVolume30dUpasgAsc: (a, b) => parseFloat(a.saleVolume30d.upasg || "0") - parseFloat(b.saleVolume30d.upasg || "0"),
  saleVolume30dUpasgDesc: (a, b) => parseFloat(b.saleVolume30d.upasg || "0") - parseFloat(a.saleVolume30d.upasg || "0"),
  saleVolume30dUsdAsc: (a, b) => parseFloat(a.saleVolume30d.usd || "0") - parseFloat(b.saleVolume30d.usd || "0"),
  saleVolume30dUsdDesc: (a, b) => parseFloat(b.saleVolume30d.usd || "0") - parseFloat(a.saleVolume30d.usd || "0"),
  listedTokenCountAsc: (a, b) => a.listedTokenCount - b.listedTokenCount,
  listedTokenCountDesc: (a, b) => b.listedTokenCount - a.listedTokenCount
};

const route = createRoute({
  method: "get",
  path: "/collections",
  summary: "Get a list of collections.",
  request: {
    query: z.object({
      skip: z.string().optional().default("0").openapi({ description: "NFTs to skip" }),
      limit: z.string().optional().default(maxLimit.toString()).openapi({ description: "NFTs to return", maximum: maxLimit }),
      sort: z
        .string()
        .optional()
        .default("createdHeightAsc")
        .openapi({ description: "Sort order", enum: Object.keys(sortOptions) })
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

  const collections = await db.query.collection.findMany({
    orderBy: [asc(collection.createdHeight), asc(collection.address)]
  });

  const mappedCollections = await Promise.all(collections.map(mapCollection));

  mappedCollections.sort(sortOptions[c.req.valid("query").sort] || sortOptions.createdHeightAsc);

  const filteredCollections = mappedCollections.slice(skip, skip + limit);

  return c.json({
    collections: filteredCollections,
    pagination: {
      total: collections.length
    }
  });
});
