using CC.CSX;
using Markdig;
using static CC.CSX.HtmlElements;
using System.Text.Json.Nodes;
using System.Globalization;
namespace BaseWeb;

public static class CSXUtils
{
    public static HtmlItem? If(bool expr, HtmlItem? item) => 
        !expr ? null : item;

    public static HtmlItem? If(this HtmlItem item, bool expr) => 
        !expr ? null : item;


    public static Task<JsonObject?> GetDiscordWidget()
    {
        var http = new HttpClient();
        return http.GetFromJsonAsync<JsonObject>(Constants.DiscordWidgetUrl); 
    }
   public static Task<JsonObject?> GetDiscordInfo()
    {
        var http = new HttpClient();
        return http.GetFromJsonAsync<JsonObject>(Constants.DiscordMembersUrl);  
    }

        

    public static string RenderMarkdown(string content)
    {
        var pipeline = new MarkdownPipelineBuilder().UseAdvancedExtensions().Build();

        var result = Markdig.Markdown.ToHtml(content, pipeline);
        return result;
    }

    public static Task<JsonObject?> GetStrapiEntry(string path) {
        var http = new HttpClient()
        {
            BaseAddress = new Uri(Constants.StrapiUrl)
        };

        var locale = CultureInfo.CurrentCulture.Name;
        if (string.IsNullOrEmpty(locale))
        {
            locale = "en";
        }
        var sep = path.Contains("?") ? "&" : "?";
        var reqPath = $"{path}{sep}locale={locale}&populate=*";

        Console.WriteLine($"Requesting {reqPath}");

        return http.GetFromJsonAsync<JsonObject>(reqPath);
    }


    public static async Task<HtmlItem> MarkdownAsync(string path, string property)
    {
        var json = await GetStrapiEntry(path);
        return await MarkdownAsync(json, property);
    }

    public static async Task<HtmlItem> MarkdownAsync(JsonObject json, string property)
    {
        var data = json["data"];

        if (data.GetType() == typeof(JsonArray)) {
            data = data.AsArray().First().AsObject();
        }

        var content = data[property].GetValue<string>();

        var div = Div(
            RenderMarkdown(content)
        );
        return div;
    }
}