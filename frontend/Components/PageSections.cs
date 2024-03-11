using CC.CSX;
using static CC.CSX.HtmlElements;
using static CC.CSX.HtmlAttributes;

namespace BaseWeb;

public static partial class Components
{
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
        allowfullscreen("true"),
        referrerpolicy("no-referrer-when-downgrade"),
        src("https://www.google.com/maps/embed/v1/place?key=AIzaSyCfx3LWmyea1kjeLAnmA2BZqxUobztiX5I&q=Base42,Skopje&zoom=20")
    );

    public static HtmlNode SectionHeading (string text) => Div(
        H2(text),
        Hr()
    );
}