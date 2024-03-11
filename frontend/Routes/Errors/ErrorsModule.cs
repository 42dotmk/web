using static BaseWeb.Layout;
using static BaseWeb.Components;
using static BaseWeb.CSXUtils;
using static CC.CSX.HtmlAttributes;
using static CC.CSX.HtmlElements;
using CC.CSX.Web;
using Microsoft.AspNetCore.Mvc;
namespace BaseWeb;

public static partial class ErrorsModule
{
    public static void UseErrorsModule(this IApplicationBuilder app) {
      app.Use(async (ctx, next) => {
        await next();

        if (ctx.Response.StatusCode == 404) {
            var contentWithLayout = await WithLayout(
              "Base42",
              Div(@class("text-primary border-secondary-500 border-primary hidden")),
              Div(@class("text-center container mx-auto p-10 h-screen flex flex-col justify-center items-center"),
                Div("404", @class("text-9xl")),
                P("Don't panic! Our Deep Thought supercomputer is currently pondering the meaning of this 404 error. In the meantime, why not enjoy a nice cup of tea?")
              )
            );

          ctx.Response.WriteAsync(contentWithLayout.ToString());
        }
      });
    }
}