using static BaseWeb.Layout;
using static BaseWeb.Components;
using static BaseWeb.CSXUtils;
using static CC.CSX.HtmlAttributes;
using static CC.CSX.HtmlElements;
using CC.CSX.Web;
using System.Globalization;

namespace BaseWeb;

public static partial class EventModule
{
    public static async Task<HtmlResult> EventDetailsPage(string eventSlug)
    {
        var res = await GetStrapiEntry($"events/?filters[slug][$eq]={eventSlug}");
        var evt = res?["data"]?[0];
        var url = evt?["promo"]?["url"]?.ToString();
        var fullUrl = url is null ? null : $"{Constants.StrapiUrlBase}{url.Substring(1)}";
        var title = evt?["title"].ToString();
        var calendarUrl = evt?["calendarUrl"]?.ToString();
        var hasStart =  DateTime.TryParse(evt?["start"]?.ToString(), null, DateTimeStyles.AssumeLocal, out var start);

        var isUpcoming = hasStart && start > DateTime.Now;
        var registerLink = evt?["registerLink"]?.ToString();
        var startStr = start.ToString(Constants.EventDateFormat);
        var contentWithLayout = await WithLayout(title,
            Div(@class("p-4"),
                Div(style("display: flex; justify-content: center;"),
                    If(fullUrl is not null, 
                        Img(src(fullUrl), @class("w-1/2"))
                    )
                ),
                H1(title),
                Hr(),
                P("Start: ", calendarUrl is not null ?  AHref(calendarUrl, startStr) : startStr),
                Hr(),
                RenderMarkdown(evt["description"].ToString()),
                If(isUpcoming && registerLink is not null, RegisterSection(registerLink)),
                LocationSection()
            )
        );
        return new HtmlResult(contentWithLayout.ToString());
    }
}