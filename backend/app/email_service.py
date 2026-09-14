import html
import logging
import threading  # 🚀 Added for background processing

import resend

from app.config import get_env
from app.schemas import ContactEnquiry

logger = logging.getLogger(__name__)


class EmailConfigurationError(RuntimeError):
    pass


def _execute_async_send(sender: str, recipient: str, enquiry: ContactEnquiry, subject: str, plain_body: str, html_body: str, confirmation_text: str, confirmation_html: str) -> None:
    """Helper function that executes the actual network requests inside the background thread."""
    try:
        # Send notification email to admin
        resend.Emails.send(
            {
                "from": sender,
                "to": [recipient],
                "reply_to": str(enquiry.email),
                "subject": subject,
                "text": plain_body,
                "html": html_body,
            }
        )
        # Send confirmation email to user
        resend.Emails.send(
            {
                "from": sender,
                "to": [str(enquiry.email)],
                "reply_to": recipient,
                "subject": "We received your Yesitech enquiry",
                "text": confirmation_text,
                "html": confirmation_html,
            }
        )
        logger.info("Contact enquiry and customer confirmation emails sent successfully in the background")
    except resend.exceptions.ResendError:
        logger.exception("Failed to send contact enquiry emails via Resend in background thread")


def send_contact_enquiry(enquiry: ContactEnquiry) -> None:
    api_key = get_env("RESEND_API_KEY")
    sender = get_env("SMTP_FROM_EMAIL")
    recipient = get_env("CONTACT_RECIPIENT_EMAIL", "info@yesitech.com")

    if not api_key or not sender:
        raise EmailConfigurationError("Resend is not configured")

    resend.api_key = api_key

    subject = f"Website enquiry: {enquiry.service}"
    plain_body = (
        "A new project enquiry was submitted on yesitech.com.\n\n"
        f"Name: {enquiry.name}\n"
        f"Email: {enquiry.email}\n"
        f"Service: {enquiry.service}\n\n"
        f"Message:\n{enquiry.message}\n"
    )
    html_body = f"""
    <html><body style="font-family:Arial,sans-serif;color:#071d2c;line-height:1.6">
      <h2 style="color:#0a766f">New Yesitech project enquiry</h2>
      <table cellpadding="6" cellspacing="0">
        <tr><td><strong>Name</strong></td><td>{html.escape(enquiry.name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>{html.escape(str(enquiry.email))}</td></tr>
        <tr><td><strong>Service</strong></td><td>{html.escape(enquiry.service)}</td></tr>
      </table>
      <h3>Message</h3>
      <p>{html.escape(enquiry.message).replace(chr(10), '<br>')}</p>
    </body></html>
    """

    confirmation_html = f"""
    <html><body style="font-family:Arial,sans-serif;color:#071d2c;line-height:1.6">
      <h2 style="color:#0a766f">Thanks for contacting Yesitech</h2>
      <p>Hello {html.escape(enquiry.name)},</p>
      <p>We have received your enquiry about <strong>{html.escape(enquiry.service)}</strong>
      and will respond within one business day.</p>
      <p>Regards,<br><strong>Yesitech Solutions</strong></p>
    </body></html>
    """
    confirmation_text = (
        f"Hello {enquiry.name},\n\n"
        "Thank you for contacting Yesitech. We have received your enquiry "
        f"about {enquiry.service} and will respond within one business day.\n\n"
        "Regards,\nYesitech Solutions"
    )

    # 🚀 Kick off the email process in a separate background thread
    email_thread = threading.Thread(
        target=_execute_async_send,
        args=(sender, recipient, enquiry, subject, plain_body, html_body, confirmation_text, confirmation_html),
        daemon=True  # daemon=True ensures the thread cleans up if the main app stops
    )
    email_thread.start()
    
    # 🌟 Immediately exits this function, returning control to your API endpoint
    logger.info("Email background thread spawned successfully")
