using static BaseWeb.Layout;
using static BaseWeb.Components;
using static BaseWeb.CSXUtils;
using static CC.CSX.HtmlAttributes;
using static CC.CSX.HtmlElements;
using CC.CSX.Web;
using Microsoft.AspNetCore.Mvc;
using CC.CSX;

namespace BaseWeb;

public static partial class HomeModule
{
  public static HtmlNode FancyBg() => Div(
        @class("-z-10"),
        id("wrapper"),
        Div(id("content"),
            Div(id("interlace")),
            Div(id("scanline")),
            Div(id("envelope"),
                Div(id("terminal"),
                    Div(id("output"))
                )
            ),
            Div(id("krc"))
        )
    );

  public static async Task<HtmlNode> Hero()
  {
    var wgt = await GetDiscordWidget();
    var present = wgt["presence_count"];
    var rnd = new Random();
    var members = wgt["members"].AsArray().OrderBy(x => rnd.Next()).Take(6).Select(m => m["avatar_url"].ToString());
    var discordInfo = await GetDiscordInfo();
    var totalCount = discordInfo["profile"]["member_count"];
    

    return Div(
        id("hero"),
        Div(
            @class("text-white py-16 relative h-full flex justify-center items-center flex-col"),
            Div(
                @class("overflow-hidden"),
                FancyBg()
            ),
            Div(
                await MarkdownAsync("home", "Hero"),

                @class("container md:pt-20 mx-auto text-center"),
                H1(
                    @class("mt-10 text-lg md:text-4xl  mb-20 font-bold")
                ),
                A(
                  href(Constants.DiscordInviteUrl),
                  target("_blank"),
                  @class("flex justify-center items-center flex-wrap mb-4"),
                  ImgSrc("/img/discord.svg", @class("nav-img mr-1 fill-white discord-img")),
                  $"{present}/{totalCount} members online",
                  Div( 
                    [
                      @class("p-2 flex -space-x-1 overflow-hidden"),
                      .. members.Select(x =>
                      ImgSrc(x,
                        @class("inline-block h-6 w-6 rounded-full ring-1 ring-secondary-500")
                      ) ).ToArray()
                    ]
                  )
                ),
                Div(
                    @class("flex justify-center items-center flex-wrap"),
                    CtaButton(
                      Span(
                        "./DISCORD.sh"
                      ),
                      Constants.DiscordInviteUrl,
                      "discord",
                      "_blank"
                    ),
                    CtaButton("./build.sh", "#about", "secondary"),
                    CtaButton("./book-event.sh", "/book", "secondary")
                )
            )
        ));
  }

  public static async Task<HtmlResult> HomePage(HttpRequest req)
  {
    var content = await GetStrapiEntry("home");

    var contentWithLayout = await WithLayout(
      "Base42",
      await Hero(),
      Div(@class("text-primary border-secondary-500 border-primary hidden")),
      Div(@class("container mx-auto p-10"),
        await MarkdownAsync(content, "Content")
      )
    );

    return new HtmlResult(contentWithLayout.ToString());
  }
}
