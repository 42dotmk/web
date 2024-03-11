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

  public static async Task<HtmlNode> Hero() => Div(
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
                Div(
                    @class("flex justify-center items-center flex-wrap"),
                    CtaButton("./build.sh", "#about", "secondary")
                )
            )
        ));
  public static async Task<HtmlResult> HomePage(HttpRequest req)
  {
    var contentWithLayout = await WithLayout(
      "Base42",
      await Hero(),
      Div(@class("text-primary border-secondary-500 border-primary hidden")),
      Div(@class("container mx-auto p-10"),
        await MarkdownAsync("home", "Content")
      )
    );

    return new HtmlResult(contentWithLayout.ToString());
  }
}