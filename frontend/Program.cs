using System.Globalization;
using BaseWeb;
using CC.CSX.Web;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Localization.Routing;
using static BaseWeb.Layout;
using static CC.CSX.HtmlAttributes;
using static CC.CSX.HtmlElements;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]{
        new CultureInfo("en"),
        new CultureInfo("mk"),
    };
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
    options.RequestCultureProviders.Insert(0, new RouteDataRequestCultureProvider());
});

builder.Services.AddRazorPages(options => {
    options.Conventions.Add(new CultureTemplatePageRouteModelConvention());
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions {
    ServeUnknownFileTypes = true,
});



app.UseRouting();

app.UseAuthorization();

app.UseRequestLocalization();

app.MapControllers();

app.MapRazorPages();


app.MapGet("/events/{eventSlug}", async (string eventSlug) => {
    var evt = await GetStrapiEntry($"events/?filters[slug][$eq]={eventSlug}");
    var url = evt["data"]?[0]?["attributes"]?["promo"]?["data"]?["attributes"]?["url"]?.ToString();
    var title = evt["data"]?[0]?["attributes"]?["title"].ToString();
    var fullUrl = url is null ? null : $"{Constants.StrapiUrlBase}{url.Substring(1)}";
    Console.WriteLine(fullUrl);
    var contentWithLayout = await WithLayout(title,
        Div(@class("p-4"),
            Div(style("display: flex; justify-content: center;"),
                If(fullUrl is not null, 
                    Img(src(fullUrl), @class("w-1/2"))
                )
            ),
            H1(title),
            Hr(),
            await MarkdownAsync(evt, "description")
        )
    );
    return new HtmlResult(contentWithLayout.ToString());
});

app.MapGet("/generate-ssg", async (IEnumerable<EndpointDataSource> endpointSources, HttpContext context) =>
{
    var endpoints = endpointSources.SelectMany(source => source.Endpoints);
    var httpClient = new HttpClient
    {
        BaseAddress = new Uri(context.Request.GetDisplayUrl())
    };

    foreach (var endpoint in endpoints)
    {
        if (endpoint.ToString()?.ElementAt(0) != '/')
        {
            continue;
        }

        var url = endpoint.ToString().Substring(1).ToLower();
        var res = await httpClient.GetAsync($"/{url}");
        var path = $"wwwroot/{url}.html";
        var fileWrite = File.Open(path, FileMode.OpenOrCreate);
        var stream = await res.Content.ReadAsStreamAsync();
        await stream.CopyToAsync(fileWrite);
        fileWrite.Close();
    }
});

if (args.Contains("-ssg")) {
    app.Start();
    var httpClient = new HttpClient();
    await httpClient.GetAsync($"{app.Urls.ElementAt(0)}/generate-ssg");
    await app.StopAsync();
} else {
    app.Run();
}
