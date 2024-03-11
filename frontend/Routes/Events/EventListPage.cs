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
                P("You browse through all our past and upcoming events here."),
                P("Want to book your own event?"),
                AHref("/book", "Fill out this form", @class("accented-text")),
                Hr(),
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