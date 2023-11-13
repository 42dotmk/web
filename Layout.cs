using CC.CSX;
using Markdig;
using static CC.CSX.HtmlElements;
using static CC.CSX.HtmlAttributes;

namespace BaseWeb;

public static class Layout
{
    public static HtmlItem Jumbo(params HtmlItem[] items) => H1(
        items.With(@class("text-1xl text-regular m-0"))
    );

    public static HtmlItem Markdown(string path) {
        var content = File.ReadAllText(path);
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

    public static HtmlNode WithLayout(string title, params HtmlItem[] items)
    {
        var navItems = new List<NavItem>() {
            new() { Text = "./about.html", Url = "#about", Icon = "/img/icons/html.svg" },
            new() { Text = "./events.html", Url = "#events", Icon = "/img/icons/html.svg" },
            new() { Text = "./projects.html", Url = "#projects", Icon = "/img/icons/html.svg" },
            new() { Text = "./contact.html", Url = "#contact", Icon = "/img/icons/html.svg" },
        };

        var NavItems = () => Fragment(
            A(href("/"), @class("hidden md:block text-white text-xl font-bold"),
                ImgSrc("/img/base.svg", style("height: 100px; width: 200px;"))
            ),
            Li(AHref("/", "/")),
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
            Li(AHref("https://discord.gg/424xxTZVYX",
                target("_blank"),
                @class("accented-text nav-with-img"),
                ImgSrc("/img/discord.svg", @class("nav-img")),
                "/discord"
            ))
        );

        var NavBar = Nav(
            // Div(
            //     @class("hidden md:flex px-10 py- sticky z-1 w-full flex justify-between items-center"),
            //     A(href("/"), @class("text-white text-xl font-bold"),
            //         ImgSrc("/img/base.svg", style("height: 100px; width: 200px;"))
            //     ),
            //     Div(
            //         @class(""),
            //         Button(@id("menu-toggle"), @class("text-white"))
            //     ),
            //     Ul(@class("hidden md:flex space-x-4"),
            //         NavItems()
            //     )
            // ),
            Div(@id("mobile-menu"), @class("bg-black bg-opacity-30 p-4 h-full border-r-secondary-500 border-r-2"),
                Ul(@class("flex flex-col space-y-4"),
                    NavItems()
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
                Meta(name("viewport"), content("width=device-width, initial-scale=1.0")),
                Script(@"
                    setInterval(() => {
                        const el = document.getElementById('krc');
                        const randX = Math.floor(Math.random() * 100);
                        const randY = Math.floor(Math.random() * 100);
                        el.style.left = randX + '%';
                        el.style.top = randY + '%';
                        const randAngle = Math.floor(Math.random() * 360);
                        const randScale = 0.3 + Math.floor(Math.random() * 1);
                        el.style.transform = 'rotate(' + randAngle + 'deg) scale(' + randScale + ')';
                    }, 100);
                ")
            ),
            Body(
                @class("bg-white dark:bg-secondary-1000 dark:text-white flex flex-col md:flex-row h-screen"),
                NavBar,
                Main(items.Append(
                    @class("flex-1 overflow-y-scroll dark:prose-invert prose-lg")
                ).Append(
                    Div(
                        @class("text-center p-10"),
                        Markdown("content/footer.md")
                    )
                ).ToArray())
            )
        );
    }
}