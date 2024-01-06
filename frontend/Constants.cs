namespace BaseWeb;

public static class Constants {
  public static string StrapiUrl = Environment.GetEnvironmentVariable("STRAPI_URL") ?? "http://localhost:1337/api/";

  public static string StrapiUrlBase = StrapiUrl.Substring(0, StrapiUrl.Length - 4);

  public static string EventDateFormat = "dd.MM.yyyy @ HH:mm";
}