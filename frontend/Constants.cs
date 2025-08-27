namespace BaseWeb;

public static class Constants
{
  public static string DiscordWidgetUrl = Environment.GetEnvironmentVariable("DISCORD_WIDGET_URL") ?? "https://discord.com/api/guilds/1095629072698179627/widget.json";
  public static string DiscordInviteUrl = Environment.GetEnvironmentVariable("DISCORD_INVITE_URL") ?? "https://discord.gg/424xxTZVYX";

  public static string DiscordMembersUrl = Environment.GetEnvironmentVariable("DISCORD_INVITE_URL") ?? "https://discord.com/api/invites/424xxTZVYX?with_counts=true";

  public static string StrapiUrl = Environment.GetEnvironmentVariable("STRAPI_URL") ?? "http://localhost:1337/api";

  public static string StrapiUrlBase = StrapiUrl.Substring(0, StrapiUrl.Length - 5);

  public static string EventDateFormat = "dd.MM.yyyy @ HH:mm"; 
}