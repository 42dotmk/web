using static BaseWeb.Layout;
using static BaseWeb.Components;
using static BaseWeb.CSXUtils;
using static CC.CSX.HtmlAttributes;
using static CC.CSX.HtmlElements;
using CC.CSX.Web;
using Microsoft.AspNetCore.Mvc;

namespace BaseWeb;

public static partial class EventModule
{
    public static async Task<HtmlResult> EventsListPage(HttpRequest req)
    {
        var hasPage = int.TryParse(req.Query["page"].ToString(), out int page);
        if (!hasPage)
        {
            page = 1;
        }

        var pagination = hasPage ? $"&pagination[page]={page}" : "";

        var tag = req.Query["tag"].ToString();
        var tagFilter = tag is not null && tag != "" ? $"&filters[tags][tagName][$eq]={tag}" : "";

        var evt = await GetStrapiEntry($"events/?sort=start:desc" + pagination + tagFilter);
        var pageCount = evt?["meta"]?["pagination"]?["pageCount"]?.GetValue<int>();
        var cards = evt?["data"]?.AsArray()?.Select(e => EventCard(e.AsObject()));
        var hasElements = cards?.Any() ?? false;
        var contentWithLayout = await WithLayout("Events",
            Div(@class("p-4"),
                H1("Events"),
                H2("Calendar"),
                Hr(),
                Details(
                    Summary("> Click to expand the calendar", @class("cursor-pointer accented-text text-primary")),
                    IFrame(
                        id("calendar"),
                        src("https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff&ctz=Europe%2FSkopje&showTz=1&showCalendars=1&showTabs=1&showPrint=1&showDate=1&showNav=1&showTitle=0&mode=WEEK&src=YmFzZTQybWtAZ21haWwuY29t"),
                        style("border:solid 1px #777; "),
                        width("100%"),
                        height("600")
                    )
                ),
                P("or maybe you want to organize an event?"),
                Div(
                    @class("flex justify-center"),
                    CtaButton("Book an Event", "/book", "secondary")
                ),
                Hr(),
                H2("Past Events"),
                P("You browse through all our past and upcoming events here."),
                Div(
                    [
                        @class("grid auto-rows-fr grid-flow-row gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"),
                          .. evt?["data"]?.AsArray()?.Select(e => EventCard(e.AsObject())),
                          If(!hasElements,
                              Div(@class("text-center p-10"),
                                  Div("No events yet")
                              )
                          )
                    ]
                ),
                Div(@class("text-center p-10"),
                    If(hasPage && page > 1,
                        AHref($"/events/?page={page - 1}", "Previous", @class("accented-text mr-2"))
                    ),
                    If(
                        page < pageCount,
                        AHref($"/events/?page={page + 1}", "Next", @class("accented-text ml-2"))
                    )
                )
            )
        );

        return new HtmlResult(contentWithLayout?.ToString());
    }
}