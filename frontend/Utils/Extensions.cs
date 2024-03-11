using CC.CSX;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Localization;

namespace BaseWeb;

public static class HtmlItemExtensions
{
    public static HtmlItem[] With(this IEnumerable<HtmlItem> items, params HtmlItem[] otherItems) => 
        items.Concat(otherItems).ToArray();

    public static async Task<HtmlString> CSX(Task<HtmlNode> item) => new((await item).ToString());
    
    public static string GetCulture(this HttpContext ctx) => ctx.Features.Get<IRequestCultureFeature>()?.RequestCulture?.Culture?.Name;
}