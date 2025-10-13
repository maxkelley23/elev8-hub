# Supabase MCP Server Setup Guide

This guide helps you integrate Supabase's MCP server with Claude Code for direct database access.

---

## Prerequisites

1. ✅ Supabase project created
2. ✅ Database password saved
3. ✅ Claude Code installed

---

## Step 1: Get Your Supabase Connection String

1. Go to your Supabase dashboard: [https://app.supabase.com](https://app.supabase.com)
2. Select your `elev8-hub` project
3. Navigate to **Settings** → **Database**
4. Scroll to **Connection String** section
5. Select **Connection pooling** → **Transaction mode**
6. Copy the connection string, which looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password

**Example:**
```
postgresql://postgres.abcdefghijk:MySecretPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## Step 2: Locate Your Claude Code Config File

Find and open the Claude Code configuration file:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**To quickly open it on Windows:**
1. Press `Win + R`
2. Type: `%APPDATA%\Claude`
3. Open `claude_desktop_config.json` in a text editor

---

## Step 3: Add Supabase MCP Server Configuration

Add this configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "YOUR_CONNECTION_STRING_HERE"
      ]
    }
  }
}
```

**Replace `YOUR_CONNECTION_STRING_HERE`** with your actual connection string from Step 1.

**Full example:**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "postgresql://postgres.abcdefghijk:MySecretPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

### If You Already Have Other MCP Servers

If your config file already has other MCP servers, just add the `supabase` entry to the existing `mcpServers` object:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "some-command"
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "YOUR_CONNECTION_STRING_HERE"
      ]
    }
  }
}
```

---

## Step 4: Restart Claude Code

1. **Close Claude Code completely** (not just the window)
2. **Reopen Claude Code**
3. The MCP server should connect automatically

---

## Step 5: Verify MCP Connection

Once Claude Code restarts, you can verify the connection by asking Claude:

```
Can you list the available MCP tools?
```

You should see Supabase-related tools like:
- `mcp__supabase__query` - Execute SQL queries
- `mcp__supabase__get_schema` - Get database schema
- `mcp__supabase__list_tables` - List all tables

---

## What Can You Do with Supabase MCP?

With the MCP server configured, Claude can:
- ✅ Execute SQL queries directly
- ✅ Inspect your database schema
- ✅ List tables and columns
- ✅ Run migrations
- ✅ Query data without writing code

**Example usage:**
```
Claude, use the Supabase MCP to:
1. List all tables in my database
2. Show me the schema for the campaigns table
3. Query the first 5 campaigns
```

---

## Troubleshooting

### Error: "MCP server failed to start"
- **Check your connection string** - Make sure it's correct
- **Verify password** - Ensure you replaced `[YOUR-PASSWORD]` with the actual password
- **Check network** - Ensure you can reach Supabase from your machine

### Error: "Connection string invalid"
- Use the **Transaction mode** connection string, not Session mode
- Make sure you're using the **pooler** URL (contains `pooler.supabase.com`)
- Don't use the direct database URL (contains `db.xxx.supabase.co`)

### MCP Tools Not Showing Up
- Fully restart Claude Code (close all windows and reopen)
- Check for typos in the JSON configuration
- Ensure the JSON is valid (no trailing commas, proper brackets)

---

## Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS:**

1. **Never commit the config file to git** - It contains your database password
2. **Use connection pooling** - Always use the pooler URL, not direct connection
3. **Service role key** - The MCP server uses your database password, which has full access
4. **Local only** - This configuration is for your local Claude Code instance only

---

## Next Steps

After setting up the MCP server:
1. ✅ Restart Claude Code
2. ✅ Ask Claude to verify MCP tools are available
3. ✅ Run the database schema using MCP: `Claude, use MCP to run the schema.sql file`
4. ✅ Continue with development

---

## Reference Links

- [Supabase MCP Server Docs](https://github.com/modelcontextprotocol/servers/tree/main/src/supabase)
- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Code MCP Guide](https://docs.claude.com/claude-code)

---

**Ready to proceed?** Once you've configured the MCP server and restarted Claude Code, let me know and I'll help you run the schema using MCP tools!
