using System.Globalization;
using BaseWeb;
using Microsoft.AspNetCore.Localization.Routing;

var builder = WebApplication.CreateBuilder(args);

var supportedCultures = new[]{
    new CultureInfo("en"),
    // new CultureInfo("mk"),
    // new CultureInfo("fr"),
};

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
    options.RequestCultureProviders.Insert(0, new RouteDataRequestCultureProvider());
});

// builder.Services.AddOutputCache(options =>
// {
//     options.AddBasePolicy(builder => 
//         builder.Expire(TimeSpan.FromMinutes(60)));
// });

builder.Services.AddCors();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    Console.WriteLine("Caching is enabled.");
    app.UseExceptionHandler("/Error");
    app.UseHsts();
    // app.UseOutputCache();
}

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions {
    ServeUnknownFileTypes = true,
});

app.UseRequestLocalization();
var localizationBuilder = app.MapGroup("/{culture:length(2)}/");

IEndpointRouteBuilder[] routeBuilders = [app, localizationBuilder];
foreach (var item in routeBuilders)
{
    item.UseHomeModule();
    item.UseEventModule();
}
app.UseErrorsModule();

// app.MapGet("/", (HttpContext ctx) => {
//     return Results.Text($"Hello World!");
// });

app.Run();