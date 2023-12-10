using CC.CSX;
using Microsoft.AspNetCore.Html;

namespace BaseWeb;

public static class HtmlItemExtensions
{
    public static HtmlItem[] With(this IEnumerable<HtmlItem> items, params HtmlItem[] otherItems) => 
        items.Concat(otherItems).ToArray();

    public static async Task<HtmlString> CSX(Task<HtmlNode> item) => new((await item).ToString());
}