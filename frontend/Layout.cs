using CC.CSX;
using Markdig;
using static CC.CSX.HtmlElements;
using static CC.CSX.HtmlAttributes;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using System.Globalization;

namespace BaseWeb;

public class CultureTemplatePageRouteModelConvention : IPageRouteModelConvention
{
    public void Apply(PageRouteModel model)
    {
        var selectorCount = model.Selectors.Count;

        for (var i = 0; i < selectorCount; i++)
        {
            var selector = model.Selectors[i];
            model.Selectors.Add(new SelectorModel
            {
                AttributeRouteModel = new AttributeRouteModel
                {
                    Order = 2,
                    Template = AttributeRouteModel.CombineTemplates("{culture?}", selector.AttributeRouteModel.Template),
                }
            });
        }
    }
};

public static class Layout
{
    public static HtmlItem Jumbo(params HtmlItem[] items) => H1(
        items.With(@class("text-1xl text-regular m-0"))
    );

    public static HtmlItem? If(bool expr, HtmlItem item) => 
        !expr ? null : item;

    public static HtmlItem? If(this HtmlItem item, bool expr) => 
        !expr ? null : item;

    public static HtmlItem Markdown(string path)
    {
        var content = File.ReadAllText(path);
        var pipeline = new MarkdownPipelineBuilder().UseAdvancedExtensions().Build();

        var result = Markdig.Markdown.ToHtml(content, pipeline);
        var div = Div(
            result
        );
        return div;
    }

    public static Task<JsonObject?> GetStrapiEntry(string path) {
        var http = new HttpClient()
        {
            BaseAddress = new Uri(Constants.StrapiUrl)
        };

        var locale = CultureInfo.CurrentCulture.Name;
        if (string.IsNullOrEmpty(locale))
        {
            locale = "en";
        }
        var sep = path.Contains("?") ? "&" : "?";
        var reqPath = $"{path}{sep}locale={locale}&populate=*";

        Console.WriteLine($"Requesting {reqPath}");

        return http.GetFromJsonAsync<JsonObject>(reqPath);
    }

    public static async Task<HtmlItem> MarkdownAsync(string path, string property)
    {
        var json = await GetStrapiEntry(path);
        return await MarkdownAsync(json, property);
    }

    public static async Task<HtmlItem> MarkdownAsync(JsonObject json, string property)
    {
        var data = json["data"];

        if (data.GetType() == typeof(JsonArray)) {
            data = data.AsArray().First().AsObject();
        }

        var content = data["attributes"][property].GetValue<string>();

        var pipeline = new MarkdownPipelineBuilder().UseAdvancedExtensions().Build();

        var result = Markdig.Markdown.ToHtml(content, pipeline);
        var div = Div(
            result
        );
        return div;
    }

    public static HtmlNode Container(params HtmlItem[] items) =>
        Div(items.With(@class("container-fluid")));

    public struct NavItem
    {
        public string Text { get; set; }
        public string Url { get; set; }
        public string Icon { get; set; }
    }

    public static async Task<HtmlNode> WithLayout(string title, params HtmlItem[] items)
    {
        var navItems = new List<NavItem>() {
            new() { Text = "./about.html", Url = "/#about", Icon = "/img/icons/html.svg" },
            new() { Text = "./events.html", Url = "/#events", Icon = "/img/icons/html.svg" },
            new() { Text = "./projects.html", Url = "/#projects", Icon = "/img/icons/html.svg" },
            new() { Text = "./contact.html", Url = "/#contact", Icon = "/img/icons/html.svg" },
        };

        var NavItems = () => Fragment(
            A(href("/"), @class("hidden md:block text-white text-xl font-bold"),
                ImgSrc("/img/base.svg", style("height: 100px; width: 200px;"))
            ),
            Li(AHref("/", "/home")),
            Fragment(
                navItems.Select(item => Li(AHref(item.Url,
                    @class("ml-4 nav-with-img"),
                    (item.Icon != null ? ImgSrc(item.Icon, @class("nav-img fill-white"), style("transform: scale(1.5)")) : Fragment()),
                    item.Text
                ))).ToArray()
            ),
            Li(AHref("https://blog.42.mk",
                target("_blank"),
                @class("accented-text nav-with-img"),
                ImgSrc("/img/icons/notebook.svg", @class("nav-img"), style("transform: scale(1.5)")),
                "/blog.md"
            )),
            Li(AHref("https://wiki.42.mk",
                target("_blank"),
                @class("accented-text nav-with-img"),
                ImgSrc("/img/icons/globe.svg", @class("nav-img"), style("transform: scale(1.5)")),
                "/wiki.md"
            )),
            Li(AHref("https://discord.gg/424xxTZVYX",
                target("_blank"),
                @class("accented-text nav-with-img"),
                ImgSrc("/img/discord.svg", @class("nav-img")),
                "/discord"
            )),
            Li(
                @class("pt-2"),
                AHref("https://github.com/42dotmk/web/",
                @class("accented-text"),
                target("_blank"),
                "[View Source]"
            ))
            // Li(AHref("/en/",
            //     @class("accented-text"),
            //     "[en]"
            // ),
            // "&nbsp;",
            // AHref("/mk/",
            //     @class("accented-text"),
            //     "[mk]"
            // ))
        );

        var NavBar = Nav(
            Div(@id("mobile-menu"), @class("bg-black bg-opacity-30 md:h-full p-4 border-r-secondary-500 border-r-2"),
                Details(
                    ("open", "true"),
                    Summary(
                        Div(@class("space-y-2 cursor-pointer"),
                            Span(@class("block w-6 h-0.5 bg-gray-600")),
                            Span(@class("block w-6 h-0.5 bg-gray-600")),
                            Span(@class("block w-6 h-0.5 bg-gray-600"))
                        )
                    ),
                    Ul(@class("flex flex-col space-y-4"),
                        NavItems()
                    )
                )
            ));

        var scripts = new List<HtmlItem> {

        };

        if (false) {
            scripts.Add(
                ScriptSrc("http://localhost:5173/@vite/client", type("module"))
            );
            scripts.Add(
                ScriptSrc("http://localhost:5173/src/main.ts", type("module"))
            );
        }

        return Html(
            @class("dark"),
            Head(
                Title(title),
                Meta(charset("utf-8")),
                LinkHref("/css/fonts.css"),
                LinkHref("/css/output.css"),
                LinkHref("/css/crt.css"),
                LinkHref("/js/style.css"),
                Meta(name("viewport"), content("width=device-width, initial-scale=1.0"))
            ),
            Body(
                @class("bg-white dark:bg-secondary-1000 dark:text-white flex flex-col md:flex-row h-screen"),
                NavBar,
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