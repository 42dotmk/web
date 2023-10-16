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
        Div(items.With(@class("container-fluid")));

    public static HtmlNode WithLayout(string title, params HtmlItem[] items)
    {
        var NavItems = (bool showHome = false) => Fragment(
            (showHome 
                ? Li(AHref("/", "Home"))
                : null)!,
            Li(AHref("/About", "About")),
            Li(AHref("/Mission", "Our Mission")),
            Li(AHref("https://discord.gg/424xxTZVYX",
                target("_blank"),
                @class("accented-text nav-with-img"),
                ImgSrc("/img/discord.svg", @class("nav-img")),
                "Join the Discord Server"
            ))
        );

        var NavBar = Nav(
            Div(
                @class("hidden md:flex px-10 py- sticky z-1 bg-black bg-opacity-30 w-full flex justify-between items-center"),
                A(href("/"), @class("text-white text-xl font-bold"),
                    ImgSrc("/img/base.svg", style("height: 100px; width: 200px;"))
                ),
                Div(
                    @class(""),
                    Button(@id("menu-toggle"), @class("text-white"))
                ),
                Ul(@class("hidden md:flex space-x-4"),
                    NavItems(true)
                )
            ),
            Div(@id("mobile-menu"), @class("md:hidden bg-black bg-opacity-30 p-4"),
                Ul(@class("flex flex-col space-y-4"),
                    NavItems(true)
                )
            ));

        return Html(
            @class("dark"),
            Head(
                Title(title),
                Meta(charset("utf-8")),
                LinkHref("/css/fonts.css"),
                LinkHref("/css/output.css"),
                LinkHref("/css/crt.css"),
                Meta(name("viewport"), content("width=device-width, initial-scale=1.0"))
            ),
            Body(
                @class("bg-white dark:bg-black dark:text-white flex flex-col h-screen"),
                NavBar,
                Main(items.Append(
                    @class("flex-1 overflow-y-scroll dark:prose-invert prose-lg")
                ).ToArray())
            )
        );
    }
}