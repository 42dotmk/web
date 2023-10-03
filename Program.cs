using Microsoft.AspNetCore.Http.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

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

        var url = endpoint.ToString().Substring(1);
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
