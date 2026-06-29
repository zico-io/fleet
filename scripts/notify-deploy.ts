// scripts/notify-deploy.ts — post a deploy notification to Discord via the butler bot.
import { execSync } from "node:child_process";

const app = process.argv[2] ?? "app";
const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_DEPLOY_CHANNEL_ID;

function gitInfo() {
  try {
    const sha = execSync("git rev-parse --short HEAD").toString().trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    return { sha, branch };
  } catch {
    return { sha: "unknown", branch: "unknown" };
  }
}

function message(name: string) {
  const { sha, branch } = gitInfo();
  return `🚀 **${name}** deployed (\`${sha}\` on \`${branch}\`)`;
}

async function main() {
  const content = message(app);

  // ponytail self-check: `bun run scripts/notify-deploy.ts butler --check`
  if (process.argv.includes("--check")) {
    console.assert(content.includes(app) && content.length > 0, "message malformed");
    console.log("ok:", content);
    return;
  }

  if (!token || !channelId) {
    console.warn(`[notify-deploy] skipped: set DISCORD_BOT_TOKEN and DISCORD_DEPLOY_CHANNEL_ID (${content})`);
    return; // best-effort; do not break the deploy
  }

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) console.warn(`[notify-deploy] Discord ${res.status}: ${await res.text()}`);
  else console.log(`[notify-deploy] sent: ${content}`);
}

main();
