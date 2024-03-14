using CC.CSX;
using static CC.CSX.HtmlElements;
using static CC.CSX.HtmlAttributes;
using static BaseWeb.CSXUtils;
using static BaseWeb.Components;
namespace BaseWeb;

public static class Layout
{
    public static HtmlItem Jumbo(params HtmlItem[] items) => H1(
        items.With(@class("text-1xl text-regular m-0"))
    );

    public static HtmlNode Container(params HtmlItem[] items) =>
        Div(items.With(@class("container-fluid")));


    public static async Task<HtmlNode> WithLayout(string title, params HtmlItem[] items)
    {
        return Html(
            @class("dark"),
            Head(
                Title(title),
                Meta(charset("utf-8")),
                LinkHref("/css/fonts.css"),
                LinkHref("/css/output.css"),
                LinkHref("/css/crt.css"),
                LinkHref("/js/style.css"),
                Meta(name("viewport"), content("width=device-width, initial-scale=1.0")),
                Link(rel("icon"), href("/img/favicon.svg")),
                Script($@"
                    window.CMS_URL = '{Constants.StrapiUrlBase}';
                    window.CMS_API_URL = '{Constants.StrapiUrlBase}/api';
                ")
            ),
            Body(
                @class("bg-white dark:bg-secondary-1000 dark:text-white flex flex-col md:flex-row h-screen"),
                NavBar(),
                Main(items.Append(
                    @class("flex-1 overflow-y-scroll overflow-x-hidden dark:prose-invert prose-lg")
                ).Append(
                    Div(
                        @class("text-center p-10"),
                        await MarkdownAsync("home", "Footer")
                    )
                ).ToArray()),
                ScriptSrc("/js/site.js")
            )
        );
    }
}