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
    public bool IsTicketPromo { get; set; }
  }

  public static HtmlNode NavBar()
  {
    var navItems = new List<NavItem>() {
      new() { Text = "./about.html", Url = "/#about", Icon = "/img/icons/html.svg" },
      new() { Text = "./events.html", Url = "/events", Icon = "/img/icons/html.svg" },
      new() { Text = "./projects.html", Url = "/#projects", Icon = "/img/icons/html.svg" },
      new() { Text = "./contact.html", Url = "/#contact", Icon = "/img/icons/html.svg" },
      new() { Text = "./wts", Url = "https://wts.sh/", Icon = "/img/icons/globe.svg", IsTicketPromo = true },
    };

    var glowAnimation = @"
      @keyframes glow {
        0%   { box-shadow: 0 0 5px #facc15; }
        50%  { box-shadow: 0 0 15px #facc15; }
        100% { box-shadow: 0 0 5px #facc15; }
      }
    ";

    var NavItems = () => Fragment(
      Style(glowAnimation),

      A(href("/"), @class("hidden md:block text-white text-xl font-bold"),
        ImgSrc("/img/base.svg", style("height: 100px; width: 200px;"))
      ),
      Li(AHref("/", "/home")),

      Fragment(
        navItems.Select(item =>
          Li(
            @class("flex items-center space-x-2 ml-4"),
            AHref(
              item.Url,
              target(item.Url.StartsWith("http") ? "_blank" : null),
              @class("menu-item nav-with-img flex items-center space-x-2"),
              item.Icon != null
                ? ImgSrc(item.Icon, @class("nav-img fill-white"), style("transform: scale(1.5)"))
                : Fragment(),
              Span(item.Text),
              item.IsTicketPromo
                ? Span("GET TIX", style("color: #facc15; border: 1px solid #facc15; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-left: 0.5rem; animation: glow 2s infinite;"))
                : Fragment()
            )
          )
        ).ToArray()
      ),

      Li(AHref("https://blog.42.mk",
        target("_blank"),
        @class("menu-item accented-text nav-with-img"),
        ImgSrc("/img/icons/notebook.svg", @class("nav-img"), style("transform: scale(1.5)")),
        "/blog.md"
      )),
      Li(AHref("https://wiki.42.mk",
        target("_blank"),
        @class("menu-item accented-text nav-with-img"),
        ImgSrc("/img/icons/globe.svg", @class("nav-img"), style("transform: scale(1.5)")),
        "/wiki.md"
      )),
      Li(AHref(Constants.DiscordInviteUrl,
        target("_blank"),
        @class("menu-item accented-text nav-with-img"),
        ImgSrc("/img/discord.svg", @class("nav-img")),
        "/discord"
      )),
      Li(
        @class("pt-2"),
        AHref("https://github.com/42dotmk/web/",
          @class("menu-item accented-text"),
          target("_blank"),
          "[View Source]"
        )
      )
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
      )
    ); 
  }
}
