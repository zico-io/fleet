/**
 * Registers the butler's Discord slash command(s). Run after changing the
 * command list below: `bun run discord:register` (needs DISCORD_BOT_TOKEN and
 * DISCORD_APPLICATION_ID in env). POST upserts a global command by name.
 *
 * The channel reads the `message` option as the user's turn input
 * (see eve's commandInteractionMessage), so every command keeps one.
 */
import {
  callDiscordApi,
  resolveDiscordApplicationId,
  resolveDiscordBotToken,
} from "eve/channels/discord";

// Discord application command option type 3 = STRING.
const commands = [
  {
    name: "ask",
    description: "Ask the butler agent a question",
    options: [
      { type: 3, name: "message", description: "What do you want to ask?", required: true },
    ],
  },
];

const appId = await resolveDiscordApplicationId();
const botToken = await resolveDiscordBotToken();

for (const body of commands) {
  const res = await callDiscordApi({
    method: "POST",
    path: `/applications/${appId}/commands`,
    body,
    botToken,
  });
  if (!res.ok) {
    console.error(`Failed to register /${body.name}: ${res.status}`, res.body);
    process.exit(1);
  }
  console.log(`Registered /${body.name}`);
}
