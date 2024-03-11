using CC.CSX;
using static CC.CSX.HtmlElements;
using static CC.CSX.HtmlAttributes;
namespace BaseWeb;

public static partial class Components
{
  public struct NavItem
  {
    public string Text { get; set; }
    public string Url { get; set; }
    public string Icon { get; set; }
  }

  public static HtmlNode NavBar() {
    var navItems = new List<NavItem>() {
      new() { Text = "./about.html", Url = "/#about", Icon = "/img/icons/html.svg" },
      new() { Text = "./events.html", Url = "/events", Icon = "/img/icons/html.svg" },
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
      //   @class("accented-text"),
      //   "[en]"
      // ),
      // "&nbsp;",
      // AHref("/mk/",
      //   @class("accented-text"),
      //   "[mk]"
      // ))
    );

    return Nav(
      Div(@id("mobile-menu"), @class("bg-black bg-opacity-30 md:h-full p-4 border-r-secondary-500 border-r-2"),
        Details(
          id("menu"),
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
  }
}