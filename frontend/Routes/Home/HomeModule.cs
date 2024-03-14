namespace BaseWeb;

public static partial class HomeModule
{
    public static void UseHomeModule(this IEndpointRouteBuilder app) {
      var events = app.MapGroup("/");

      events.MapGet("/", HomePage);
      events.MapGet("/book", BookEvent);
      events.MapGet("/discord", Discord);
    }
}