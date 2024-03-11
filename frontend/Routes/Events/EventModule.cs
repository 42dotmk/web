using CC.CSX.Web;

namespace BaseWeb;

public static partial class EventModule
{
    public static void UseEventModule(this IEndpointRouteBuilder app) {
      var events = app.MapGroup("/events");

      events.MapGet("/", EventsListPage);
      events.MapGet("/{eventSlug}", EventDetailsPage);
    }
}