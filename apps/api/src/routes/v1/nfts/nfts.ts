import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { getNftsWithStats, nftSortOptions } from "@src/services/nft.service";

const maxLimit = 100;

const route = createRoute({
  method: "get",
  path: "/nfts",
  summary: "Get a list of NFTs.",
  request: {
    query: z.object({
      skip: z.string().optional().default("0").openapi({ description: "NFTs to skip" }),
      limit: z.string().optional().default(maxLimit.toString()).openapi({ description: "NFTs to return", maximum: maxLimit }),
      saleType: z
        .string()
        .optional()
        .openapi({
          description: "Filter by sale type",
          enum: ["LIVE_AUCTION", "FIXED_PRICE", "NOT_FOR_SALE"]
        }),
      sort: z.string().optional().openapi({
        description: "Sort order",
        enum: nftSortOptions
      })
    })
  },
  responses: {
    400: {
      description: "Invalid parameter"
    },
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
                saleType: z.enum(["LIVE_AUCTION", "FIXED_PRICE", "NOT_FOR_SALE"]),
                listedPrice: z.number().nullable(),
                listedDenom: z.string().nullable(),
                saleCount: z.number(),
                saleCount24h: z.number(),
                saleCount7d: z.number(),
                saleCount30d: z.number(),
                saleCount24hPercentageChange: z.number().nullable(),
                saleCount7dPercentageChange: z.number().nullable(),
                saleCount30dPercentageChange: z.number().nullable()
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
  const saleType = c.req.valid("query").saleType;
  const sort = c.req.valid("query").sort;

  if (sort && !nftSortOptions.includes(sort)) {
    return c.text("Invalid sort option, valid options are: " + nftSortOptions.join(","), 400);
  }
  console.time("getNftsWithStats");
  const { nfts, totalCount } = await getNftsWithStats({
    saleType,
    sort,
    skip,
    limit
  });
  console.timeEnd("getNftsWithStats");

  return c.json({
    nfts: nfts.map((nft) => ({
      tokenId: nft.tokenId,
      owner: nft.owner,
      metadata: nft.metadata,
      createdOnBlockHeight: nft.createdOnBlockHeight,
      mintedOnBlockHeight: nft.mintedOnBlockHeight,
      mintPrice: nft.mintPrice,
      mintDenom: nft.mintDenom,
      saleType: nft.forSalePrice ? "FIXED_PRICE" : "NOT_FOR_SALE",
      listedPrice: nft.forSalePrice || null,
      listedDenom: nft.forSaleDenom || null,
      saleCount: parseInt(nft.saleCount),
      saleCount24h: parseInt(nft.saleCount24h),
      saleCount7d: parseInt(nft.saleCount7d),
      saleCount30d: parseInt(nft.saleCount30d),
      saleCount24hPercentageChange: nft.saleCount24hPercentageChange,
      saleCount7dPercentageChange: nft.saleCount7dPercentageChange,
      saleCount30dPercentageChange: nft.saleCount30dPercentageChange
    })),
    pagination: {
      total: totalCount
    }
  });
});
