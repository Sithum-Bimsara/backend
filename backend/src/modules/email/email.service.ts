import { Resend } from "resend";

export interface SendBookingTicketEmailInput {
  recipientEmail: string;
  customerName?: string | null;
  bookingId: string;
  dealTitle?: string | null;
  dealLocation?: string | null;
  startDatetime?: Date | string | null;
  quantity: number;
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt?: Date | string | null;
  selectedAddOns?: Array<{
    description: string;
    additionalPrice: number;
  }>;
}

export interface SendCommentNotificationEmailInput {
  recipientEmail: string;
  recipientName?: string | null;
  commenterName?: string | null;
  commentContent: string;
  postId: string;
  postPreview?: string | null;
}

export interface SendAccommodationBookingEmailInput {
  recipientEmail: string;
  customerName?: string | null;
  bookingId: string;
  propertyName?: string | null;
  propertyLocation?: string | null;
  unitName?: string | null;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt?: Date | string | null;
}

export interface SendChatNotificationEmailInput {
  recipientEmail: string;
  recipientName?: string | null;
  senderName: string;
  messageContent: string;
  chatId: string;
}

export interface SendAdminChatInitiationEmailInput {
  recipientEmail: string;
  travellerName: string;
  travellerEmail: string;
  merchantName: string;
  merchantEmail: string;
  businessName?: string | null;
  contextType: 'deal' | 'accommodation';
  contextName: string;
  chatId: string;
}


const maskApiKey = (key?: string) => {
  if (!key) return "missing";
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

const formatDateTime = (value?: Date | string | null) => {
  if (!value) return "TBD";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "TBD";

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const hasValidDateTime = (value?: Date | string | null) => {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
};

export const sendBookingTicketEmail = async (input: SendBookingTicketEmailInput) => {
  const emailEnabled = (process.env.BOOKING_EMAIL_ENABLED ?? "true").toLowerCase() === "true";

  console.log("[email-service] sendBookingTicketEmail called", {
    bookingId: input.bookingId,
    recipientEmail: input.recipientEmail,
    paymentStatus: input.paymentStatus,
    emailEnabled,
  });

  if (!emailEnabled) {
    console.log("[email-service] Skipped: BOOKING_EMAIL_ENABLED is false");
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.RESEND_REPLY_TO;

  console.log("[email-service] env check", {
    hasApiKey: Boolean(apiKey),
    apiKeyPreview: maskApiKey(apiKey),
    fromEmail,
    replyTo,
  });

  if (!apiKey || !fromEmail) {
    console.warn("[email-service] Skipped sending ticket email: RESEND_API_KEY or RESEND_FROM_EMAIL is missing.");
    return;
  }

  const appName = process.env.BOOKING_APP_NAME || "Escape Mode";
  const bookingReference = `BYD-${input.bookingId.slice(0, 8).toUpperCase()}`;
  const customerName = input.customerName?.trim() || "Customer";
  const dealTitle = input.dealTitle?.trim() || "Tour Package";
  const dealLocation = input.dealLocation?.trim() || "Location not specified";

  const amount = Number.isFinite(input.totalPrice) ? input.totalPrice : 0;
  const quantity = Number.isFinite(input.quantity) ? input.quantity : 1;

  const tripStart = formatDateTime(input.startDatetime);
  const bookedAt = formatDateTime(input.createdAt);

  const safeCustomerName = escapeHtml(customerName);
  const safeDealTitle = escapeHtml(dealTitle);
  const safeDealLocation = escapeHtml(dealLocation);
  const safeBookingReference = escapeHtml(bookingReference);
  const selectedAddOns = Array.isArray(input.selectedAddOns) ? input.selectedAddOns : [];
  const selectedAddOnsTotal = selectedAddOns.reduce((sum, addon) => {
    const price = Number.isFinite(addon.additionalPrice) ? addon.additionalPrice : 0;
    return sum + price;
  }, 0);
  const addOnsTextLines = selectedAddOns.map((addon) => {
    const safeDescription = addon.description?.trim() || "Unnamed add-on";
    const price = Number.isFinite(addon.additionalPrice) ? addon.additionalPrice : 0;
    return `  - ${safeDescription}: +$${price.toFixed(2)}`;
  });
  const addOnsHtmlRows = selectedAddOns
    .map((addon) => {
      const safeDescription = escapeHtml(addon.description?.trim() || "Unnamed add-on");
      const price = Number.isFinite(addon.additionalPrice) ? addon.additionalPrice : 0;
      return `<tr><td style="padding:8px 12px;">${safeDescription}</td><td style="padding:8px 12px; text-align:right;">+$${price.toFixed(2)}</td></tr>`;
    })
    .join("");

  const subject = `${appName} Ticket Confirmation - ${bookingReference}`;
  const text = [
    `Hi ${customerName},`,
    "",
    "Your booking is confirmed. Here is your ticket:",
    `Reference: ${bookingReference}`,
    `Deal: ${dealTitle}`,
    `Location: ${dealLocation}`,
    `Trip Start: ${tripStart}`,
    `Number of slots reserved: ${quantity}`,
    ...(selectedAddOns.length > 0
      ? [
          "Selected add-ons:",
          ...addOnsTextLines,
          `Selected add-ons total: +$${selectedAddOnsTotal.toFixed(2)}`,
        ]
      : []),
    `Amount Paid: $${amount.toFixed(2)}`,
    `Payment Status: ${input.paymentStatus.toUpperCase()}`,
    `Booked At: ${bookedAt}`,
    "",
    "Please keep this email as your ticket confirmation.",
    `- ${appName}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px; color:#0f172a;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden;">
        <div style="padding:18px 20px; background:linear-gradient(90deg,#0e2a47,#0e9e82); color:#ffffff;">
          <h2 style="margin:0; font-size:20px;">${escapeHtml(appName)} Booking Ticket</h2>
          <p style="margin:6px 0 0; font-size:13px; opacity:0.9;">Your reservation is confirmed</p>
        </div>
        <div style="padding:20px;">
          <p style="margin:0 0 14px; font-size:14px;">Hi ${safeCustomerName},</p>
          <p style="margin:0 0 16px; font-size:14px;">Thank you for your booking. Keep this email as your ticket confirmation.</p>

          <div style="border:1px solid #e2e8f0; border-radius:10px; overflow:hidden;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; font-size:14px;">
              <tr><td style="padding:10px 12px; background:#f8fafc; width:40%;">Reference</td><td style="padding:10px 12px; font-weight:700;">${safeBookingReference}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Deal</td><td style="padding:10px 12px;">${safeDealTitle}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Location</td><td style="padding:10px 12px;">${safeDealLocation}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Trip Start</td><td style="padding:10px 12px;">${escapeHtml(tripStart)}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Number of slots reserved</td><td style="padding:10px 12px;">${quantity}</td></tr>
              ${selectedAddOns.length > 0 ? `<tr><td style="padding:10px 12px; background:#f8fafc;">Selected add-ons total</td><td style="padding:10px 12px;">+$${selectedAddOnsTotal.toFixed(2)}</td></tr>` : ""}
              <tr><td style="padding:10px 12px; background:#f8fafc;">Amount Paid</td><td style="padding:10px 12px; font-weight:700;">$${amount.toFixed(2)}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Payment Status</td><td style="padding:10px 12px;">${escapeHtml(input.paymentStatus.toUpperCase())}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Booked At</td><td style="padding:10px 12px;">${escapeHtml(bookedAt)}</td></tr>
            </table>
          </div>

          ${selectedAddOns.length > 0 ? `<div style="margin-top:14px; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden;"><div style="padding:10px 12px; background:#f8fafc; font-size:13px; font-weight:700;">Selected Add-Ons</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; font-size:13px;">${addOnsHtmlRows}</table></div>` : ""}

          <p style="margin:16px 0 0; color:#475569; font-size:12px;">If you have questions, reply to this email and our team will assist you.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    const resendResult = await resend.emails.send({
      from: fromEmail,
      to: [input.recipientEmail],
      ...(replyTo ? { replyTo } : {}),
      subject,
      html,
      text,
    });

    console.log("[email-service] resend response", resendResult);
  } catch (err) {
    console.error("[email-service] resend send failed", err);
    throw err;
  }
};

export const sendDealUpdateNotification = async (input: {
  recipientEmail: string;
  customerName: string;
  dealTitle: string;
  dealId: string;
}) => {
  const emailEnabled = (process.env.BOOKING_EMAIL_ENABLED ?? "true").toLowerCase() === "true";
  if (!emailEnabled) return;

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) return;

  const appName = process.env.BOOKING_APP_NAME || "Escape Mode";
  const subject = `Update to your locked deal: ${input.dealTitle}`;
  
  const text = `Hi ${input.customerName},

Important update: The details for "${input.dealTitle}" have been updated by the merchant. 

Since you have an active lock on this deal, we wanted to make sure you are aware of the latest information. 

You can view the updated details here: ${process.env.FRONTEND_URL}/deals/${input.dealId}

Thank you,
- ${appName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px; color:#0f172a;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden;">
        <div style="padding:18px 20px; background:linear-gradient(90deg,#0e2a47,#0e9e82); color:#ffffff;">
          <h2 style="margin:0; font-size:20px;">Important Update</h2>
          <p style="margin:6px 0 0; font-size:13px; opacity:0.9;">Detail update for your locked deal</p>
        </div>
        <div style="padding:20px;">
          <p style="margin:0 0 14px; font-size:14px;">Hi ${escapeHtml(input.customerName)},</p>
          <p style="margin:0 0 16px; font-size:14px; line-height:1.6;">The details for the deal <strong>${escapeHtml(input.dealTitle)}</strong> have been updated by the merchant.</p>
          <p style="margin:0 0 20px; font-size:14px; line-height:1.6;">Since you have an active lock on this deal, we recommend reviewing the updated information before completing your booking.</p>
          
          <div style="text-align:center; margin:30px 0;">
            <a href="${process.env.FRONTEND_URL}/deals/${input.dealId}" style="background:#0e9e82; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">View Updated Deal</a>
          </div>

          <p style="margin:16px 0 0; color:#475569; font-size:12px;">Thank you for choosing ${escapeHtml(appName)}.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: [input.recipientEmail],
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error("[deal-update-notification] failed to send email", err);
  }
};

export const sendCommentNotificationEmail = async (input: SendCommentNotificationEmailInput) => {
  const emailEnabled = (process.env.COMMENT_NOTIFICATION_EMAIL_ENABLED ?? "true").toLowerCase() === "true";

  console.log("[email-service] sendCommentNotificationEmail called", {
    postId: input.postId,
    recipientEmail: input.recipientEmail,
    emailEnabled,
  });

  if (!emailEnabled) {
    console.log("[email-service] Skipped: COMMENT_NOTIFICATION_EMAIL_ENABLED is false");
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.RESEND_REPLY_TO;

  console.log("[email-service] env check", {
    hasApiKey: Boolean(apiKey),
    apiKeyPreview: maskApiKey(apiKey),
    fromEmail,
    replyTo,
  });

  if (!apiKey || !fromEmail) {
    console.warn("[email-service] Skipped sending notification: RESEND_API_KEY or RESEND_FROM_EMAIL is missing.");
    return;
  }

  const appName = process.env.COMMUNITY_APP_NAME || process.env.BOOKING_APP_NAME || "Escape Mode";
  const recipientName = input.recipientName?.trim() || "there";
  const commenterName = input.commenterName?.trim() || "Someone";
  const commentPreview = truncate(input.commentContent.trim() || "(No comment text)", 240);
  const postPreview = truncate(input.postPreview?.trim() || "Your post", 180);

  const safeRecipientName = escapeHtml(recipientName);
  const safeCommenterName = escapeHtml(commenterName);
  const safeCommentPreview = escapeHtml(commentPreview);
  const safePostPreview = escapeHtml(postPreview);

  const subject = `${appName}: New comment on your post`;

  const text = [
    `Hi ${recipientName},`,
    "",
    `${commenterName} commented on your post.`,
    "",
    `Post: ${postPreview}`,
    `Comment: ${commentPreview}`,
    `Post ID: ${input.postId}`,
    "",
    `- ${appName}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px; color:#0f172a;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden;">
        <div style="padding:18px 20px; background:linear-gradient(90deg,#0e2a47,#0e9e82); color:#ffffff;">
          <h2 style="margin:0; font-size:20px;">${escapeHtml(appName)} Community</h2>
          <p style="margin:6px 0 0; font-size:13px; opacity:0.9;">New comment notification</p>
        </div>
        <div style="padding:20px;">
          <p style="margin:0 0 14px; font-size:14px;">Hi ${safeRecipientName},</p>
          <p style="margin:0 0 16px; font-size:14px;"><strong>${safeCommenterName}</strong> commented on your post.</p>

          <div style="border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; margin-bottom:14px;">
            <div style="padding:10px 12px; background:#f8fafc; font-size:13px; font-weight:700;">Post</div>
            <div style="padding:12px; font-size:14px;">${safePostPreview}</div>
          </div>

          <div style="border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; margin-bottom:14px;">
            <div style="padding:10px 12px; background:#f8fafc; font-size:13px; font-weight:700;">Comment</div>
            <div style="padding:12px; font-size:14px;">${safeCommentPreview}</div>
          </div>

          <p style="margin:0; color:#475569; font-size:12px;">Post ID: ${escapeHtml(input.postId)}</p>
        </div>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: [input.recipientEmail],
      ...(replyTo ? { replyTo } : {}),
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("[comment-email] resend send failed", error);
    throw error;
  }
};

export const sendAccommodationBookingEmail = async (input: SendAccommodationBookingEmailInput) => {
  const emailEnabled = (process.env.BOOKING_EMAIL_ENABLED ?? "true").toLowerCase() === "true";

  if (!emailEnabled) return;

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.RESEND_REPLY_TO;

  if (!apiKey || !fromEmail) return;

  const appName = process.env.BOOKING_APP_NAME || "Escape Mode";
  const bookingReference = `ACC-${input.bookingId.slice(0, 8).toUpperCase()}`;
  const customerName = input.customerName?.trim() || "Customer";
  const propertyName = input.propertyName?.trim() || "Accommodation";
  const propertyLocation = input.propertyLocation?.trim() || "Location not specified";
  const unitName = input.unitName?.trim() || "Unit";

  const checkIn = formatDateTime(input.checkInDate);
  const checkOut = formatDateTime(input.checkOutDate);
  const bookedAt = formatDateTime(input.createdAt);

  const safeCustomerName = escapeHtml(customerName);
  const safePropertyName = escapeHtml(propertyName);
  const safeUnitName = escapeHtml(unitName);
  const safeBookingReference = escapeHtml(bookingReference);

  const subject = `${appName} Stay Confirmation - ${bookingReference}`;
  const text = [
    `Hi ${customerName},`,
    "",
    "Your stay is confirmed. Here is your reservation details:",
    `Reference: ${bookingReference}`,
    `Property: ${propertyName}`,
    `Location: ${propertyLocation}`,
    `Unit: ${unitName}`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Guests: ${input.guests}`,
    `Total Price: $${input.totalPrice.toFixed(2)}`,
    `Status: ${input.status.toUpperCase()}`,
    `Booked At: ${bookedAt}`,
    "",
    "Please keep this email as your booking confirmation.",
    `- ${appName}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px; color:#0f172a;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden;">
        <div style="padding:18px 20px; background:linear-gradient(90deg,#0e2a47,#0e9e82); color:#ffffff;">
          <h2 style="margin:0; font-size:20px;">${escapeHtml(appName)} Stay Confirmation</h2>
          <p style="margin:6px 0 0; font-size:13px; opacity:0.9;">Your reservation is confirmed</p>
        </div>
        <div style="padding:20px;">
          <p style="margin:0 0 14px; font-size:14px;">Hi ${safeCustomerName},</p>
          <p style="margin:0 0 16px; font-size:14px;">Thank you for your booking. Keep this email as your reservation confirmation.</p>
          
          <div style="border:1px solid #e2e8f0; border-radius:10px; overflow:hidden;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; font-size:14px;">
              <tr><td style="padding:10px 12px; background:#f8fafc; width:40%;">Reference</td><td style="padding:10px 12px; font-weight:700;">${safeBookingReference}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Property</td><td style="padding:10px 12px;">${safePropertyName}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Unit</td><td style="padding:10px 12px;">${safeUnitName}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Check-in</td><td style="padding:10px 12px;">${escapeHtml(checkIn)}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Check-out</td><td style="padding:10px 12px;">${escapeHtml(checkOut)}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Guests</td><td style="padding:10px 12px;">${input.guests}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Total Price</td><td style="padding:10px 12px; font-weight:700;">$${input.totalPrice.toFixed(2)}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Status</td><td style="padding:10px 12px;">${escapeHtml(input.status.toUpperCase())}</td></tr>
              <tr><td style="padding:10px 12px; background:#f8fafc;">Booked At</td><td style="padding:10px 12px;">${escapeHtml(bookedAt)}</td></tr>
            </table>
          </div>

          <p style="margin:16px 0 0; color:#475569; font-size:12px;">If you have questions, reply to this email and our team will assist you.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: [input.recipientEmail],
      ...(replyTo ? { replyTo } : {}),
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error("[accommodation-email] failed to send stay confirmation", err);
  }
};

export const sendChatNotificationEmail = async (input: SendChatNotificationEmailInput) => {
  const emailEnabled = (process.env.CHAT_NOTIFICATION_EMAIL_ENABLED ?? "true").toLowerCase() === "true";
  if (!emailEnabled) return;

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) return;

  const appName = process.env.BOOKING_APP_NAME || "Escape Mode";
  const recipientName = input.recipientName?.trim() || "there";
  const subject = `New message from ${input.senderName} on ${appName}`;
  
  const safeRecipientName = escapeHtml(recipientName);
  const safeSenderName = escapeHtml(input.senderName);
  const safeMessage = escapeHtml(truncate(input.messageContent, 500));

  const text = `Hi ${recipientName},
  
You have a new message from ${input.senderName}:

"${input.messageContent}"

Reply here: ${process.env.FRONTEND_URL}/messages/${input.chatId}

Thank you,
- ${appName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px; color:#0f172a;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden;">
        <div style="padding:18px 20px; background:linear-gradient(90deg,#0e2a47,#0e9e82); color:#ffffff;">
          <h2 style="margin:0; font-size:20px;">${escapeHtml(appName)} Chat</h2>
          <p style="margin:6px 0 0; font-size:13px; opacity:0.9;">You received a new message</p>
        </div>
        <div style="padding:20px;">
          <p style="margin:0 0 14px; font-size:14px;">Hi ${safeRecipientName},</p>
          <p style="margin:0 0 16px; font-size:14px;"><strong>${safeSenderName}</strong> sent you a message:</p>
          
          <div style="background:#f1f5f9; border-radius:10px; padding:16px; margin:20px 0; border-left:4px solid #0e9e82;">
            <p style="margin:0; font-size:14px; line-height:1.6; color:#334155; font-style:italic;">"${safeMessage}"</p>
          </div>

          <div style="text-align:center; margin:25px 0;">
            <a href="${process.env.FRONTEND_URL}/messages/${input.chatId}" style="background:#0e2a47; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">View & Reply</a>
          </div>

          <p style="margin:16px 0 0; color:#475569; font-size:12px;">This is an automated notification from ${escapeHtml(appName)}. Please do not reply directly to this email.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: [input.recipientEmail],
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error("[chat-email] failed to send notification", err);
  }
};

export const sendAdminChatInitiationEmail = async (input: SendAdminChatInitiationEmailInput) => {
  const emailEnabled = (process.env.CHAT_NOTIFICATION_EMAIL_ENABLED ?? "true").toLowerCase() === "true";
  if (!emailEnabled) return;

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) return;

  const appName = process.env.BOOKING_APP_NAME || "Escape Mode";
  const subject = `[Admin] New Chat Initiated: ${input.travellerName} & ${input.businessName || input.merchantName}`;
  
  const text = `Hi Admin,
  
A new chat has been initiated on ${appName}.

CONTEXT:
Type: ${input.contextType.toUpperCase()}
Name: ${input.contextName}

TRAVELLER:
Name: ${input.travellerName}
Email: ${input.travellerEmail}

MERCHANT:
Name: ${input.merchantName}
Business: ${input.businessName || 'N/A'}
Email: ${input.merchantEmail}

View Chat: ${process.env.FRONTEND_URL}/messages/${input.chatId}

- ${appName} System`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f1f5f9; padding:24px; color:#0f172a;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden;">
        <div style="padding:18px 20px; background:#0e2a47; color:#ffffff;">
          <h2 style="margin:0; font-size:18px;">[Admin] New Chat Notification</h2>
          <p style="margin:6px 0 0; font-size:13px; opacity:0.9;">A new conversation has started</p>
        </div>
        <div style="padding:20px;">
          <div style="margin-bottom:20px; padding:15px; background:#f8fafc; border-radius:10px; border-left:4px solid #0e9e82;">
            <h3 style="margin:0 0 10px; font-size:14px; color:#0e2a47;">Context Details</h3>
            <p style="margin:0; font-size:14px;"><strong>Type:</strong> ${input.contextType.toUpperCase()}</p>
            <p style="margin:5px 0 0; font-size:14px;"><strong>Name:</strong> ${escapeHtml(input.contextName)}</p>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
            <div style="padding:15px; border:1px solid #e2e8f0; border-radius:10px;">
              <h3 style="margin:0 0 10px; font-size:14px; color:#0e2a47;">Traveller</h3>
              <p style="margin:0; font-size:13px;"><strong>Name:</strong> ${escapeHtml(input.travellerName)}</p>
              <p style="margin:5px 0 0; font-size:13px;"><strong>Email:</strong> ${escapeHtml(input.travellerEmail)}</p>
            </div>
            <div style="padding:15px; border:1px solid #e2e8f0; border-radius:10px;">
              <h3 style="margin:0 0 10px; font-size:14px; color:#0e2a47;">Merchant</h3>
              <p style="margin:0; font-size:13px;"><strong>Business:</strong> ${escapeHtml(input.businessName || 'N/A')}</p>
              <p style="margin:5px 0 0; font-size:13px;"><strong>Name:</strong> ${escapeHtml(input.merchantName)}</p>
              <p style="margin:5px 0 0; font-size:13px;"><strong>Email:</strong> ${escapeHtml(input.merchantEmail)}</p>
            </div>
          </div>

          <div style="text-align:center; margin:30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/messages" style="background:#0e9e82; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">View Conversation</a>
          </div>

          <p style="margin:0; color:#64748b; font-size:12px; text-align:center;">This is a system notification from ${escapeHtml(appName)}.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: [input.recipientEmail],
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error("[admin-chat-email] failed to send notification", err);
  }
};
