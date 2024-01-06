using System.Globalization;
using BaseWeb;
using CC.CSX;
using CC.CSX.Web;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Localization.Routing;
using static BaseWeb.Layout;
using static BaseWeb.Components;
using static BaseWeb.CSXUtils;
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
    var res = await GetStrapiEntry($"events/?filters[slug][$eq]={eventSlug}");
    var evt = res?["data"]?[0];
    var url = evt?["promo"]?["data"]?["url"]?.ToString();
    var title = evt?["title"].ToString();
    var fullUrl = url is null ? null : $"{Constants.StrapiUrlBase}{url.Substring(1)}";
    var hasStart =  DateTime.TryParse(evt?["start"]?.ToString(), null, DateTimeStyles.AssumeLocal, out var start);

    var isUpcoming = hasStart && start > DateTime.Now;
    var registerLink = evt?["registerLink"]?.ToString();

    var contentWithLayout = await WithLayout(title,
        Div(@class("p-4"),
            Div(style("display: flex; justify-content: center;"),
                If(fullUrl is not null, 
                    Img(src(fullUrl), @class("w-1/2"))
                )
            ),
            H1(title),
            Hr(),
            P("Start: ", start.ToString(Constants.EventDateFormat)),
            Hr(),
            RenderMarkdown(evt["description"].ToString()),
            If(isUpcoming && registerLink is not null, RegisterSection(registerLink)),
            LocationSection()
        )
    );
    return new HtmlResult(contentWithLayout.ToString());
});

app.MapGet("/events/", async (HttpContext ctx) => {
    var hasPage = int.TryParse(ctx.Request.Query["page"].ToString(), out int page);
    if (!hasPage)  {
        page = 1;
    }

    var pagination = hasPage ? $"&pagination[page]={page}" : "";

    var tag = ctx.Request.Query["tag"].ToString();
    var tagFilter = tag is not null && tag != "" ? $"&filters[tags][tagName][$eq]={tag}" : "";

    var evt = await GetStrapiEntry($"events/?sort=start:desc" + pagination + tagFilter);
    var pageCount = evt?["meta"]?["pagination"]?["pageCount"]?.GetValue<int>();
    var cards = evt?["data"]?.AsArray()?.Select(e => EventCard(e.AsObject()));
    var hasElements = cards?.Any() ?? false;
    var contentWithLayout = await WithLayout("Events",
        Div(@class("p-4"),
            H1("Events"),
            P("You browse through all our past and upcoming events here."),
            P("Want to book your own event?"),
            AHref("/book", "Fill out this form", @class("accented-text")),
            Hr(),
            Div(
                [
                    @class("grid auto-rows-fr grid-flow-row gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"),
                    .. evt?["data"]?.AsArray()?.Select(e => EventCard(e.AsObject())),
                    If(!hasElements,
                        Div(@class("text-center p-10"),
                            Div("No events yet")
                        )
                    )
                ]
            ),
            Div(@class("text-center p-10"),
                If(hasPage && page > 1, 
                    AHref($"/events/?page={page - 1}", "Previous", @class("accented-text mr-2"))
                ),
                If(
                    page < pageCount,
                    AHref($"/events/?page={page + 1}", "Next", @class("accented-text ml-2"))
                )
            )
        )
    );
    
    return new HtmlResult(contentWithLayout?.ToString());
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
