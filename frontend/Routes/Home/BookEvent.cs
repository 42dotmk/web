using static BaseWeb.Layout;
using static BaseWeb.Components;
using static BaseWeb.CSXUtils;
using static CC.CSX.HtmlAttributes;
using static CC.CSX.HtmlElements;
using CC.CSX.Web;
using Microsoft.AspNetCore.Mvc;
using CC.CSX;

namespace BaseWeb;

public static partial class HomeModule
{
  public static HtmlNode BookingForm() => Div(
    @class("max-w-4xl mx-auto text-white p-6 rounded-md shadow-md"),
    H2(@class("text-2xl font-semibold mb-4"), "Please fill in the event information:"),
    Form(
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("organizer-entity"), "Entity that's organizing the event *"),
            Input(type("text"), id("organizer-entity"), name("organizer-entity"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("initiator-name"), "Full name of the initiator *"),
            Input(type("text"), id("initiator-name"), name("initiator-name"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("email"), "E-mail"),
            Input(type("email"), id("email"), name("email"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("phone"), "Phone number"),
            Input(type("tel"), id("phone"), name("phone"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("company-name"), "Organization name (if it's organized by an organization) *"),
            Input(type("text"), id("company-name"), name("company-name"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("event-type"), "Type of event *"),
            Select(
                id("event-type"),
                name("event-type"),
                required("true"),
                Option(value(""), "Please pick an event type"),
                Option(value("Conference"), "Conference"),
                Option(value("Workshop"), "Workshop"),
                Option(value("Other"), "Other")
            )
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("event-name"), "Name of the event *"),
            Input(type("text"), id("event-name"), name("event-name"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("event-theme"), "Theme of the event *"),
            Input(type("text"), id("event-theme"), name("event-theme"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("event-purpose"), "Purpose of the event *"),
            Textarea(id("event-purpose"), name("event-purpose"), rows("4"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("event-date"), "Date of the event *"),
            Input(type("date"), id("event-date"), name("event-date"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("event-start-time"), "Start time *"),
            Input(type("time"), id("event-start-time"), name("event-start-time"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("event-end-time"), "End time *"),
            Input(type("time"), id("event-end-time"), name("event-end-time"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), "Physical presence event *"),
            Div(
                @class("flex items-center"),
                Input(type("radio"), id("physical-presence-yes"), name("physical-presence"), value("yes"), required("true")),
                Label(@for("physical-presence-yes"), "Yes")
            ),
            Div(
                @class("flex items-center"),
                Input(type("radio"), id("physical-presence-no"), name("physical-presence"), value("no"), required("true")),
                Label(@for("physical-presence-no"), "No")
            )
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("event-agenda"), "Event agenda *"),
            Textarea(id("event-agenda"), name("event-agenda"), rows("4"), required("true"))
        ),
        Div(
            @class("mb-4"),
            Label(@class("block mb-1"), @for("expected-guests"), "Expected number of guests"),
            Input(type("number"), id("expected-guests"), name("expected-guests"))
        ),
        Div(
            "Please check your spam folder if you don't see the confirmation email in your inbox. We run our own mail server and some email providers might mark our emails as spam."
        ),
        Div(
            @class("text-center"),
            Button(id("submit"), @class("cta-button-primary mt-8 w-full"), type("submit"), "Submit")
        )
    ),
    Script(@"
      const submit = document.getElementById('submit');
      const form = document.querySelector('form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        submit.setAttribute('disabled', true);
        submit.innerHTML = 'Submitting...';
        try {
          const res = await fetch('" + Constants.StrapiUrl + @"event-requests/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
          })
          .then(response => response.json())
          console.log('Success:', res);
          alert('Your request has been submitted successfully! Check your email for a confirmation. (Check spam too!)');
        }
        catch (error) {
          console.error('Error:', error);
          alert('Something went wrong. Please try again later.');
        }
        finally {
          submit.removeAttribute('disabled');
          submit.innerHTML = 'Submit';
        }
      });
    ")
  );

  public static async Task<HtmlResult> BookEvent(HttpRequest req)
  {
    var contentWithLayout = await WithLayout(
      "Base42",
      Div(@class("text-primary border-secondary-500 border-primary hidden")),
      Div(@class("container mx-auto p-10"),
        BookingForm()
      )
    );

    return new HtmlResult(contentWithLayout.ToString());
  }
}