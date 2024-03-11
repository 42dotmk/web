namespace BaseWeb;

public static class Constants {
  public static string StrapiUrl = Environment.GetEnvironmentVariable("STRAPI_URL") ?? "https://cms.42.mk/api/";

  public static string StrapiUrlBase = StrapiUrl.Substring(0, StrapiUrl.Length - 4);

  public static string EventDateFormat = "dd.MM.yyyy @ HH:mm";
}