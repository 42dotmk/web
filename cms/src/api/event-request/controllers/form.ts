const formToJsonMap = {
  "organizer-entity": "organizingEntity",
  "initiator-name": "initiatorName",
  "email": "initiatorEmail",
  "phone": "initiatorPhoneNumber",
  "company-name": "organization",
  "event-type": "eventType",
  "event-name": "eventName",
  "event-theme": "eventTheme",
  "event-purpose": "eventPurpose",
  "event-date": "eventDate",
  "event-start-time": "eventStart",
  "event-end-time": "eventEnd",
  "physical-presence": "physicalPresence",
  "event-agenda": "eventAgenda",
  "expected-guests": "expectedGuests",
};

export default {
  async submit(ctx: any, next) {
    const eventRequest = Object.keys(ctx.request.body).reduce((acc, key) => {
      const value = ctx.request.body[key];
      const mappedKey = formToJsonMap[key];
      if (mappedKey) {
        acc[mappedKey] = value;
      }
      return acc;
    }, {} as any);


    eventRequest.physicalPresence = eventRequest.physicalPresence === "yes";
    eventRequest.eventStart += ":00";
    eventRequest.eventEnd += ":00";

    const res = await strapi.entityService.create("api::event-request.event-request", {
      data: eventRequest,
    });

    const requestCopy = `<p><strong>Organizing entity</strong>: ${eventRequest.organizingEntity}</p>
    <p><strong>Initiator name</strong>: ${eventRequest.initiatorName}</p>
    <p><strong>Initiator email</strong>: ${eventRequest.initiatorEmail}</p>
    <p><strong>Initiator phone</strong> number: ${eventRequest.initiatorPhoneNumber}</p>
    <p><strong>Organization:</strong> ${eventRequest.organization}</p>
    <p><strong>Event type</strong>: ${eventRequest.eventType}</p>
    <p><strong>Event name</strong>: ${eventRequest.eventName}</p>
    <p><strong>Event theme</strong>: ${eventRequest.eventTheme}</p>
    <p><strong>Event purpose</strong>: ${eventRequest.eventPurpose}</p>
    <p><strong>Event date</strong>: ${eventRequest.eventDate}</p>
    <p><strong>Event start</strong>: ${eventRequest.eventStart}</p>
    <p><strong>Event end</strong>: ${eventRequest.eventEnd}</p>
    <p><strong>Physical presence</strong>: ${eventRequest.physicalPresence}</p>
    <p><strong>Event agenda</strong>: ${eventRequest.eventAgenda}</p>
    <p><strong>Expected guests</strong>: ${eventRequest.expectedGuests}</p>
  `;

    await strapi.plugins['email'].services.email.send({
      to: eventRequest.initiatorEmail,
      from: 'hello@42.mk',
      replyTo: 'hello@42.mk',
      subject: 'Your event request has been received! - 42.mk',
      html: `Thank you for submitting your event request. We will get back to you as soon as possible.
      Here's a copy of your request:
      <br/><br/>
      ${requestCopy}
    `
    }),
      await strapi.plugins['email'].services.email.send({
        to: 'hello@42.mk',
        from: 'hello@42.mk',
        replyTo: eventRequest.initiatorEmail,
        subject: `New event request from ${eventRequest.initiatorName}`,
        html: `A new event request has been submitted. Here's a copy of the request:
      <br/><br/>
      ${requestCopy}
    `
      }),

      ctx.body = res;
  },
};