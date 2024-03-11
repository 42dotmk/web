using CC.CSX;

namespace BaseWeb;

public static partial class Components
{
    public static HtmlNode CtaButton(string text, string hrefAttr, string type, string _target = "_self",
        string classes = "") =>
        HtmlElements.A(
            HtmlAttributes.href(hrefAttr),
            HtmlAttributes.target(_target),
            type == "primary"
                ? HtmlAttributes.@class($"cta-button-primary {classes}")
                : HtmlAttributes.@class($"cta-button-secondary {classes}"),
            text
        );
}