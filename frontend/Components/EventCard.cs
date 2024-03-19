using CC.CSX;
using static CC.CSX.HtmlElements;
using static CC.CSX.HtmlAttributes;
using System.Text.Json.Nodes;
using static BaseWeb.CSXUtils;
using System.Globalization;

namespace BaseWeb;


public static partial class Components
{
    public static HtmlNode Tag (string tag) => Span(
        @class("inline-block border-secondary-500 border-2 rounded-full px-3 py-1 text-sm font-semibold text-primary mr-2 mb-2"),
        tag
    );
    
    public static HtmlNode EventCard(JsonObject evt) {
        var hasStart =  DateTime.TryParse(evt?["start"]?.ToString(), null, DateTimeStyles.AssumeLocal, out var start);

        var url = evt?["promo"]?["url"]?.ToString();
        var fullUrl = url is null ? null : $"{Constants.StrapiUrlBase}{url}";

        var registerLink = evt?["registerLink"]?.ToString();
        var isUpcoming = hasStart && start > DateTime.Now;

        return Div(
            isUpcoming ? @class("clippy max-w-sm overflow-hidden shadow-lg border-2 border-secondary-500 hover:border-primary transition")
                : @class("clippy opacity-[0.5] hover:opacity-[0.9] max-w-sm overflow-hidden shadow-lg border-2 border-secondary-800 hover:border-primary transition"),
            Div(@class("px-6 pt-4"),
                A(
                    !isUpcoming
                        ? @class("font-bold text-xl mb-2 accented-text text-neutral-400")
                        : @class("font-bold text-xl mb-2 accented-text"),
                    href("/events/" + evt?["slug"]?.ToString()),
                    evt?["title"]?.ToString() ?? "Untitled"
                ),
                If(hasStart,
                    Div(
                        @class(isUpcoming ? "pt-4" : "pt-4 line-through text-neutral-500"),
                        "Start: ",
                        start.ToString(Constants.EventDateFormat)
                    )
                ),
                Div(
                    @class("event-card-image"),
                    style($"display: flex; justify-content: center;"),
                    Div(
                      Img(src(fullUrl ?? "/img/404.jpg"), @class("w-full"))
                    )
                ),
                P(@class("text-gray-300 text-base"), evt?["summary"]?.ToString()),
                If(isUpcoming && registerLink is not null, Div(
                    @class("flex flex-wrap justify-center"),
                    CtaButton("./register.sh", registerLink, "secondary", "full")
                ))
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