using CC.CSX;
using static CC.CSX.HtmlElements;
using static CC.CSX.HtmlAttributes;
using System.Text.Json.Nodes;
using static BaseWeb.CSXUtils;

namespace BaseWeb;


public static class Components
{
    public static HtmlNode Tag (string tag) => Span(
        @class("inline-block border-secondary-500 border-2 rounded-full px-3 py-1 text-sm font-semibold text-primary mr-2 mb-2"),
        tag
    );

    public static HtmlNode EventCard(JsonObject evt) {
        var start = evt?["start"]?.GetValue<DateTime?>();
        var isUpcoming = start is not null && start > DateTime.Now;
        return Div(
            @class("clippy max-w-sm overflow-hidden shadow-lg border-2 border-secondary-500"),
            Div(@class("px-6 pt-4"),
                A(
                    @class("font-bold text-xl mb-2  accented-text"),
                    href("/events/" + evt?["slug"]?.ToString()),
                    evt?["title"]?.ToString() ?? "Untitled"
                ),
                If(start is not null,
                    Div(
                        !isUpcoming
                            ? @class("pt-4 line-through text-neutral-500")
                            : @class("pt-4"),
                        "Start: ",
                        start.ToString()
                    )
                ),
                P(@class("text-gray-300 text-base"), evt?["summary"]?.ToString())
            ),
            Div(
                [
                    @class("px-6 pb-2"),
                    .. (evt?["tags"]?.AsArray()?.Select(tag => Tag(tag["tagName"].ToString()))?.ToArray() ?? [])
                ]
            )
        );
    }
}