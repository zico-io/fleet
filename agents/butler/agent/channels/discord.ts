import { discordChannel } from "eve/channels/discord";

// Discord HTTP Interactions endpoint, served at /eve/v1/discord and reached
// through the gateway at /agents/butler/v1/discord (apps/api proxies it as-is).
// Needs DISCORD_PUBLIC_KEY, DISCORD_BOT_TOKEN, and DISCORD_APPLICATION_ID in env.
// Defaults handle signature verification, deferral, replies, and HITL.
export default discordChannel();
