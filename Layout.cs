using CC.CSX;
using static CC.CSX.HtmlElements;
using static CC.CSX.HtmlAttributes;

namespace BaseWeb;

public static class Layout
{
    public static HtmlItem Jumbo(params HtmlItem[] items) => H1(
        items.With(@class("text-1xl text-regular m-0"))
    );

    public static HtmlNode Container(params HtmlItem[] items) => 
        Div(items.With( @class("container-fluid")));

    public static HtmlNode WithLayout(string title, params HtmlItem[] items)
    {
        var NavBar = Nav(
            @class("container-fluid"),
            Ul(Li(AHref("/", 
                ImgSrc("img/base.svg", style("height: 100px; width: 200px;"))
            ))),
            Ul(
                Li(AHref("/About", "About")),
                Li(AHref("/Mission", "Our Mission")),
                Li(AHref("https://discord.gg/424xxTZVYX",
                    target("_blank"),
                    @class("accented-text nav-with-img"),
                    ImgSrc("img/discord.svg", @class("nav-img")),
                    "Join the Discord Server"
                ))
            )
        );
        
        return Html(
            Head(
                Title(title),
                Meta(charset("utf-8")),
                LinkHref("https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"),
                LinkHref("css/site.css"),
                // LinkHref("css/output.css"),
                Meta(name("viewport"), content("width=device-width, initial-scale=1.0"))
            ),
            Body(
                ("data-theme", "dark"),
                NavBar,
                Main(items.Append(@class("container-fluid text-sm float-right")).ToArray())
            )
        );
    }
}