import { factories } from '@strapi/strapi';

const UID = 'api::membership.membership';
let stripeInstance: any = null;

const USER_UID = 'plugin::users-permissions.user';

function getStripe() {
  if (!stripeInstance) {
    const Stripe = require('stripe');
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

function getPriceIdForTier(tier: string): string | null {
  if (tier === 'yearly') return process.env.STRIPE_YEARLY_PRICE_ID || null;
  return process.env.STRIPE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ID || null;
}

function getTierForPriceId(priceId: string): 'monthly' | 'yearly' {
  const yearlyId = process.env.STRIPE_YEARLY_PRICE_ID;
  if (yearlyId && priceId === yearlyId) return 'yearly';
  return 'monthly';
}

async function getOrCreateStripeCustomer(ctx, stripe) {
  const documentId = ctx.state.user.documentId;

  const user = await strapi.documents(USER_UID).findOne({ documentId });

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
    metadata: { strapiDocumentId: documentId },
  });

  await strapi.documents(USER_UID).update({
    documentId,
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export default factories.createCoreController(UID, ({ strapi }) => ({
  async me(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    const memberships = await strapi.documents(UID).findMany({
      filters: { user: { documentId: ctx.state.user.documentId } },
      sort: { startDate: 'desc' },
      populate: [],
    });

    const active = memberships.find((m: any) => m.status === 'active');

    ctx.body = {
      memberships,
      active: active || null,
    };
  },

  async createCheckoutSession(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    try {
      const stripe = getStripe();
      const tier = (ctx.request.body as any)?.tier || 'monthly';
      const priceId = getPriceIdForTier(tier);

      if (!priceId) {
        return ctx.badRequest(`STRIPE_${tier.toUpperCase()}_PRICE_ID not configured`);
      }

      const existing = await strapi.db.query(UID).findMany({
        where: { user: ctx.state.user.id, status: 'active' },
      });

      if (existing.length > 0) {
        return ctx.badRequest('Active membership already exists. Use Manage Subscription to make changes.');
      }

      const customerId = await getOrCreateStripeCustomer(ctx, stripe);

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: process.env.STRIPE_SUCCESS_URL || 'https://42.mk/membership/success',
        cancel_url: process.env.STRIPE_CANCEL_URL || 'https://42.mk/membership/cancel',
        metadata: { tier },
        subscription_data: {
          metadata: {
            strapiDocumentId: ctx.state.user.documentId,
            tier,
          },
        },
      });

      ctx.body = { url: session.url, sessionId: session.id };
    } catch (error) {
      strapi.log.error('Failed to create checkout session:', error);
      return ctx.internalServerError('Failed to create checkout session');
    }
  },

  async createPortalSession(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    try {
      const stripe = getStripe();
      const user = await strapi.documents(USER_UID).findOne({
        documentId: ctx.state.user.documentId,
      });

      if (!user.stripeCustomerId) {
        return ctx.badRequest('No Stripe customer found');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: process.env.STRIPE_RETURN_URL || 'https://42.mk/membership/manage',
      });

      ctx.body = { url: session.url };
    } catch (error) {
      strapi.log.error('Failed to create portal session:', error);
      return ctx.internalServerError('Failed to create portal session');
    }
  },

  async webhook(ctx) {
    const sig = ctx.request.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      ctx.status = 400;
      ctx.body = { error: 'Missing signature or webhook secret' };
      return;
    }

    const rawBody = ctx.state.rawBody as string | undefined;
    if (!rawBody) {
      strapi.log.error('Missing raw body in ctx.state.rawBody');
      ctx.status = 400;
      ctx.body = { error: 'Missing raw body' };
      return;
    }

    try {
      const stripe = getStripe();
      const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      const eventId = event.id;

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const customerId = session.customer;
          const subscriptionId = session.subscription;

          // For one-time payments, still require paid status
          if (session.mode !== 'subscription' && session.payment_status !== 'paid') {
            strapi.log.info(`[${eventId}] One-time payment not yet received: ${session.payment_status}`);
            break;
          }

          const existing = await strapi.db.query(UID).findMany({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (existing.length > 0) {
            strapi.log.info(`[${eventId}] Membership already exists for subscription ${subscriptionId}`);
            break;
          }

          let strapiDocumentId = session.metadata?.strapiDocumentId || session.subscription_details?.metadata?.strapiDocumentId;
          let customerDocId: string | null = null;

          if (!strapiDocumentId) {
            const customer = await stripe.customers.retrieve(customerId);
            customerDocId = (customer as any).metadata?.strapiDocumentId;
            if (customerDocId) {
              strapi.log.warn(`[${eventId}] No documentId in session metadata, falling back to customer metadata`);
              strapiDocumentId = customerDocId;
            }
          }

          if (!strapiDocumentId) {
            strapi.log.error(`[${eventId}] No strapiDocumentId in session or customer metadata: ${customerId}`);
            throw new Error(`No strapiDocumentId found for customer ${customerId}`);
          }

          let tier = session.metadata?.tier || session.subscription_details?.metadata?.tier;
          if (!tier && subscriptionId) {
            // Fallback: retrieve subscription and read metadata or price ID
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            tier = sub.metadata?.tier || getTierForPriceId(sub.items?.data?.[0]?.price?.id);
          }
          tier ||= 'monthly';
          const isPaid = session.payment_status === 'paid';

          await strapi.documents(UID).create({
            data: {
              user: strapiDocumentId,
              tier,
              status: isPaid ? 'active' : 'pending',
              startDate: new Date(),
              stripeSubscriptionId: subscriptionId,
            },
          });

          await strapi.documents(USER_UID).update({
            documentId: strapiDocumentId,
            data: { userType: 'member' },
          });

          strapi.log.info(`[${eventId}] Membership created for user ${strapiDocumentId}, tier: ${tier}, status: ${isPaid ? 'active' : 'pending'}`);
          break;
        }

        case 'customer.subscription.created': {
          const createdSub = event.data.object;
          const createdSubId = createdSub.id;

          const existingMembership = await strapi.db.query(UID).findMany({
            where: { stripeSubscriptionId: createdSubId },
          });

          if (existingMembership.length > 0) {
            strapi.log.info(`[${eventId}] Membership already exists for subscription ${createdSubId}`);
            break;
          }

          const customerId = createdSub.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const strapiDocumentId = (customer as any).metadata?.strapiDocumentId;

          if (!strapiDocumentId) {
            strapi.log.warn(`[${eventId}] No strapiDocumentId for customer ${customerId}, membership not created`);
            break;
          }

          const priceId = createdSub.items?.data?.[0]?.price?.id;
          const tier = createdSub.metadata?.tier || getTierForPriceId(priceId);
          const currentPeriodEnd = new Date(createdSub.current_period_end * 1000);

          await strapi.documents(UID).create({
            data: {
              user: strapiDocumentId,
              tier,
              status: 'active',
              startDate: new Date(),
              endDate: currentPeriodEnd,
              stripeSubscriptionId: createdSubId,
            },
          });

          await strapi.documents(USER_UID).update({
            documentId: strapiDocumentId,
            data: { userType: 'member' },
          });

          strapi.log.info(`[${eventId}] Membership created from subscription for user ${strapiDocumentId}, tier: ${tier}`);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const subscriptionId = subscription.id;

          strapi.log.info(`[${eventId}] Subscription ${subscriptionId} deleted`);

          const memberships = await strapi.db.query(UID).findMany({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (memberships.length > 0) {
            const membership = memberships[0];

            await strapi.db.query(UID).update({
              where: { id: membership.id },
              data: { status: 'cancelled', endDate: new Date() },
            });

            const user = await strapi.db.query(USER_UID).findOne({
              where: { id: membership.user },
            });

            if (user?.document_id) {
              await strapi.documents(USER_UID).update({
                documentId: user.document_id,
                data: { userType: 'user' },
              });
              strapi.log.info(`[${eventId}] User ${user.document_id} reverted to free`);
            }
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const subscriptionId = subscription.id;

          strapi.log.info(`[${eventId}] Subscription ${subscriptionId} updated`);

          const memberships = await strapi.db.query(UID).findMany({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (memberships.length > 0) {
            const membership = memberships[0];
            let status = membership.status;

            if (subscription.cancel_at_period_end) {
              status = 'cancel_pending';
            } else if (subscription.status === 'active') {
              status = 'active';
            } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
              status = 'cancelled';
            }

            let tier = membership.tier;
            if (subscription.items?.data?.[0]?.price?.id) {
              const newPriceId = subscription.items.data[0].price.id;
              tier = getTierForPriceId(newPriceId);
            }

            await strapi.db.query(UID).update({
              where: { id: membership.id },
              data: { status, tier },
            });
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription || invoice.lines?.data?.[0]?.subscription;

          if (!subscriptionId) {
            strapi.log.warn(`[${eventId}] Invoice ${invoice.id} has no subscription ID, skipping`);
            break;
          }

          const memberships = await strapi.db.query(UID).findMany({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (memberships.length > 0) {
            const membership = memberships[0];
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

            await strapi.db.query(UID).update({
              where: { id: membership.id },
              data: { status: 'active', endDate: currentPeriodEnd },
            });
          } else {
            // Async payment: membership may not exist yet, create it
            strapi.log.warn(`[${eventId}] Membership not found for subscription ${subscriptionId}, creating from invoice`);

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const customerId = subscription.customer;
            const customer = await stripe.customers.retrieve(customerId);
            const strapiDocumentId = (customer as any).metadata?.strapiDocumentId;

            if (!strapiDocumentId) {
              throw new Error(`No strapiDocumentId found for customer ${customerId}`);
            }

            const priceId = subscription.items?.data?.[0]?.price?.id;
            const tier = getTierForPriceId(priceId);
            const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

            await strapi.documents(UID).create({
              data: {
                user: strapiDocumentId,
                tier,
                status: 'active',
                startDate: new Date(),
                endDate: currentPeriodEnd,
                stripeSubscriptionId: subscriptionId,
              },
            });

            await strapi.documents(USER_UID).update({
              documentId: strapiDocumentId,
              data: { userType: 'member' },
            });

            strapi.log.info(`[${eventId}] Membership created from invoice for user ${strapiDocumentId}`);
          }
          break;
        }

        case 'invoice.payment_failed': {
          const failedInvoice = event.data.object;
          const failedSubId = failedInvoice.subscription;

          const failedMemberships = await strapi.db.query(UID).findMany({
            where: { stripeSubscriptionId: failedSubId },
          });

          if (failedMemberships.length > 0) {
            await strapi.db.query(UID).update({
              where: { id: failedMemberships[0].id },
              data: { status: 'pending' },
            });
          }
          break;
        }

        default:
          strapi.log.info(`[${eventId}] Unhandled event type: ${event.type}`);
      }

      ctx.body = { received: true };
    } catch (error) {
      strapi.log.error('Stripe webhook error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Webhook processing failed', received: false };
    }
  },
}));
