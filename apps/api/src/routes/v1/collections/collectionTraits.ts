import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { OpenAPI_ExampleCollection } from "@src/utils/constants";
import { getCollectionTraits } from "@src/services/collection.service";

const route = createRoute({
  method: "get",
  path: "/collections/{address}/traits",
  summary: "Get collection trait statistics",
  request: {
    params: z.object({
      address: z.string().openapi({
        description: "Collection Address",
        example: OpenAPI_ExampleCollection,
      }),
    }),
    query: z.object({
      traitType: z.string().optional().openapi({
        description: "Filter by specific trait type",
        example: "Background",
      }),
      startDate: z.string().optional().openapi({
        description: "Start date for metrics calculation (ISO format)",
        example: "2024-01-01",
      }),
      endDate: z.string().optional().openapi({
        description: "End date for metrics calculation (ISO format)",
        example: "2024-03-20",
      }),
      sortBy: z.enum(["top", "trending"]).optional().openapi({
        description: "Sort results by metric",
        example: "top",
      }),
    }),
  },
  responses: {
    404: { description: "Collection not found" },
    200: {
      description: "Collection trait statistics",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              traitType: z.string(),
              traitValue: z.string(),
              metrics: z.object({
                totalSales: z.number(),
                volume: z.number(),
                price: z.number(),
                change24HourPercent: z.number().nullable(),
                change7DayPercent: z.number().nullable(),
                change30DayPercent: z.number().nullable(),
              }).strict(),
            }).strict()
          ),
        },
      },
    },
  },
});

export default new OpenAPIHono().openapi(route, async (c) => {
  const { address } = c.req.valid("param");
  const { traitType, startDate, endDate, sortBy } = c.req.valid("query");

  try {
    const traits = await getCollectionTraits(address, {
      traitType,
      startDate,
      endDate,
      sortBy,
    });
    return c.json(traits);
  } catch (error) {
    if (error instanceof Error && error.message === "Collection not found") {
      return c.text("Collection not found", 404);
    }
    throw error;
  }
});
