namespace BaseWeb;

public static class Constants {
  public static string StrapiUrl = Environment.GetEnvironmentVariable("STRAPI_URL") ?? "http://localhost:1337/api/";
}