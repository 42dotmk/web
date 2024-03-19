using CC.CSX;

namespace BaseWeb;

public static partial class Components
{
    public static HtmlNode CtaButton(HtmlNode text, string hrefAttr, string type, string _target = "_self") =>
        HtmlElements.A(
            HtmlAttributes.href(hrefAttr),
            HtmlAttributes.target(_target),
            HtmlAttributes.@class("cta-button " + type),
            text
        );
}