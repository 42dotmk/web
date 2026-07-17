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

interface EventRequestInput {
  organizingEntity: string;
  initiatorName: string;
  initiatorEmail: string;
  initiatorPhoneNumber: string;
  organization: string;
  eventType: string;
  eventName: string;
  eventTheme: string;
  eventPurpose: string;
  eventDate: string;
  eventStart: string;
  eventEnd: string;
  eventAgenda: string;
  expectedGuests: number;
  physicalPresence: boolean;
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Field "${field}" must be a string`);
  }
  return value;
}

function assertNumber(value: unknown, field: string): number {
  const num = typeof value === 'string' ? Number(value) : value;
  if (typeof num !== 'number' || Number.isNaN(num)) {
    throw new Error(`Field "${field}" must be a number`);
  }
  return num;
}

export default {
  async submit(ctx, next) {
    const body = ctx.request.body;

    try {
      if (!body || typeof body !== 'object') {
        ctx.status = 400;
        ctx.body = { error: { message: 'Invalid request body' } };
        return;
      }

      const formData = body.data || body; // Accept both wrapped and unwrapped

      if (!formData || typeof formData !== 'object' || Object.keys(formData).length === 0) {
        ctx.status = 400;
        ctx.body = { error: { message: 'No form data provided' } };
        return;
      }

      const raw: Record<string, unknown> = Object.keys(formData).reduce((acc, key) => {
        const mappedKey = formToJsonMap[key];
        if (mappedKey) {
          acc[mappedKey] = formData[key];
        }
        return acc;
      }, {} as Record<string, unknown>);

      const eventRequest: EventRequestInput = {
        organizingEntity: assertString(raw.organizingEntity, 'organizingEntity'),
        initiatorName: assertString(raw.initiatorName, 'initiatorName'),
        initiatorEmail: assertString(raw.initiatorEmail, 'initiatorEmail'),
        initiatorPhoneNumber: assertString(raw.initiatorPhoneNumber, 'initiatorPhoneNumber'),
        organization: assertString(raw.organization, 'organization'),
        eventType: assertString(raw.eventType, 'eventType'),
        eventName: assertString(raw.eventName, 'eventName'),
        eventTheme: assertString(raw.eventTheme, 'eventTheme'),
        eventPurpose: assertString(raw.eventPurpose, 'eventPurpose'),
        eventDate: assertString(raw.eventDate, 'eventDate'),
        eventStart: assertString(raw.eventStart, 'eventStart'),
        eventEnd: assertString(raw.eventEnd, 'eventEnd'),
        eventAgenda: assertString(raw.eventAgenda, 'eventAgenda'),
        expectedGuests: assertNumber(raw.expectedGuests, 'expectedGuests'),
        physicalPresence: raw.physicalPresence === 'yes',
      };

      eventRequest.eventStart += ':00';
      eventRequest.eventEnd += ':00';

      const res = await strapi.documents("api::event-request.event-request").create({
        data: eventRequest,
      });

      const startDateTime = `${eventRequest.eventDate}T${eventRequest.eventStart}`;

      const draftEvent = await strapi.documents("api::event.event").create({
        data: {
          title: eventRequest.eventName,
          description: `${eventRequest.eventPurpose}\n\n${eventRequest.eventTheme}`,
          start: startDateTime,
          summary: eventRequest.eventAgenda,
          tags: eventRequest.eventTheme ? [{ tagName: eventRequest.eventTheme }] : [],
        },
        status: "draft",
      });

      await strapi.documents("api::event-request.event-request").update({
        documentId: res.documentId,
        data: { event: draftEvent.documentId } as Record<string, unknown>,
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
      });

      await strapi.plugins['email'].services.email.send({
        to: 'hello@42.mk',
        from: 'hello@42.mk',
        replyTo: eventRequest.initiatorEmail,
        subject: `New event request from ${eventRequest.initiatorName}`,
        html: `A new event request has been submitted. Here's a copy of the request:
        <br/><br/>
        ${requestCopy}
      `
      });

      ctx.body = res;
    } catch (error) {
      console.error('Event request submission error:', error);

      // Try to notify admin of the error
      try {
        await strapi.plugins['email'].services.email.send({
          to: 'hello@42.mk',
          from: 'hello@42.mk',
          subject: '[ERROR] Event request submission failed',
          html: `<p>An error occurred while processing an event request submission.</p>
          <p><strong>Error:</strong> ${error.message || String(error)}</p>
          <p><strong>Stack:</strong></p>
          <pre>${error.stack || 'No stack trace available'}</pre>
          <p><strong>Request body:</strong></p>
          <pre>${JSON.stringify(body, null, 2)}</pre>
        `
        });
      } catch (emailError) {
        console.error('Failed to send error notification email:', emailError);
      }

      ctx.status = 500;
      ctx.body = {
        error: {
          message: 'Failed to submit event request. The administrator has been notified.',
        }
      };
    }
  },
};
