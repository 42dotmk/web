using CC.CSX;
using static CC.CSX.HtmlElements;
using static CC.CSX.HtmlAttributes;
using System.Text.Json.Nodes;
using static BaseWeb.CSXUtils;
using System.Globalization;

namespace BaseWeb;


public static class Components
{
    public static HtmlNode Tag (string tag) => Span(
        @class("inline-block border-secondary-500 border-2 rounded-full px-3 py-1 text-sm font-semibold text-primary mr-2 mb-2"),
        tag
    );

    public static HtmlNode EventCard(JsonObject evt) {
        var hasStart =  DateTime.TryParse(evt?["start"]?.ToString(), null, DateTimeStyles.AssumeLocal, out var start);

        var registerLink = evt?["registerLink"]?.ToString();
        var isUpcoming = hasStart && start > DateTime.Now;

        return Div(
            isUpcoming
                ? @class("clippy max-w-sm overflow-hidden shadow-lg border-2 border-secondary-500 hover:border-primary transition")
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
                        !isUpcoming
                            ? @class("pt-4 line-through text-neutral-500")
                            : @class("pt-4"),
                        "Start: ",
                        start.ToString(Constants.EventDateFormat)
                    )
                ),
                P(@class("text-gray-300 text-base"), evt?["summary"]?.ToString()),
                If(isUpcoming && registerLink is not null, Div(
                    @class("flex flex-wrap justify-center"),
                    CtaButton("./register.sh", "https://www.meetup.com/awsugmkd/events/298150894/", "secondary", "full")
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

    public static HtmlNode RegisterSection (string link) => Div(
        SectionHeading("Register:"),
        P("There is limited seating, so please register for the event if you would like to attend."),
        Div(
            @class("flex flex-wrap justify-center"),
            CtaButton("./register.sh", link, "secondary")
        )
    );

    public static HtmlNode LocationSection () => Div(
        SectionHeading("Location:"),
        AHref(
            "https://goo.gl/maps/Xs32u8UZLD2GjM3y9",
            @class("location-link"),
            target("_blank"),
            "Base42 is located in a Garage at Rimska 25, Skopje."
        ),
        P("Oh... there's also this map:"),
        Map()
    );

    public static HtmlNode Map () => IFrame(
        @class("w-full"),
        height("400"),
        style("border:0; width: 100%"),
        loading("lazy"),
        allowfullscreen(),
        referrerpolicy("no-referrer-when-downgrade"),
        src("https://www.google.com/maps/embed/v1/place?key=AIzaSyCfx3LWmyea1kjeLAnmA2BZqxUobztiX5I&q=Base42,Skopje&zoom=20")
    );

    public static HtmlNode SectionHeading (string text) => Div(
        FixH2(text),
        Hr()
    );

    public static HtmlNode CtaButton (string text, string hrefAttr, string type, string _target="self", string classes="") =>
        A(
            href(hrefAttr),
            target(_target),
            type == "primary" 
                ? @class($"cta-button-primary {classes}")
                : @class($"cta-button-secondary {classes}"),
            text
        );

    // TODO: Move to CSX
    public static HtmlAttribute loading (string type) => new ("loading", type);
    public static HtmlAttribute referrerpolicy (string policy) => new ("referrerpolicy", policy);
    public static HtmlAttribute allowfullscreen () => new ("allowfullscreen");
    public static HtmlNode FixH2 (params HtmlItem[] items) => new ("h2", items);

}