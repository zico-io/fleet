import { defineTool } from "eve/tools";
import { z } from "zod";

// The runtime tool name comes from the filename, so the model sees `get_weather`.
//
// This is the scaffold's one example tool. It returns deterministic mock data so
// the agent has a working tool out of the box. To make it real, swap the body for
// a fetch() to a weather provider (e.g. open-meteo.com) and return its response.
export default defineTool({
  description: "Get the current (demo) weather for a city. Returns mock data.",
  inputSchema: z.object({
    city: z.string().describe("City name, e.g. 'Brooklyn'"),
  }),
  async execute(input) {
    return {
      city: input.city,
      condition: "Sunny",
      temperatureF: 72,
      source: "mock",
    };
  },
});
