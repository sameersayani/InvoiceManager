import html
import logging
import smtplib
import ssl
from email.message import EmailMessage

try:
    import certifi
except ImportError:
    certifi = None

from app.config import get_bool, get_env
from app.schemas import ContactEnquiry

logger = logging.getLogger(__name__)


class EmailConfigurationError(RuntimeError):
    pass


def send_contact_enquiry(enquiry: ContactEnquiry) -> None:
    host = get_env("SMTP_HOST")
    port = int(get_env("SMTP_PORT", "587"))
    username = get_env("SMTP_USERNAME")
    password = get_env("SMTP_PASSWORD")
    sender = get_env("SMTP_FROM_EMAIL", username)
    recipient = get_env("CONTACT_RECIPIENT_EMAIL", "info@yesitech.com")
    use_ssl = get_bool("SMTP_USE_SSL", False)
    use_tls = get_bool("SMTP_USE_TLS", not use_ssl)

    if not host or not sender:
        raise EmailConfigurationError("SMTP is not configured")

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

    company_message = EmailMessage()
    company_message["Subject"] = subject
    company_message["From"] = sender
    company_message["To"] = recipient
    company_message["Reply-To"] = str(enquiry.email)
    company_message.set_content(plain_body)
    company_message.add_alternative(html_body, subtype="html")

    confirmation = EmailMessage()
    confirmation["Subject"] = "We received your Yesitech enquiry"
    confirmation["From"] = sender
    confirmation["To"] = str(enquiry.email)
    confirmation["Reply-To"] = recipient
    confirmation.set_content(
        f"Hello {enquiry.name},\n\n"
        "Thank you for contacting Yesitech. We have received your enquiry "
        f"about {enquiry.service} and will respond within one business day.\n\n"
        "Regards,\nYesitech Solutions"
    )
    confirmation.add_alternative(
        f"""
        <html><body style="font-family:Arial,sans-serif;color:#071d2c;line-height:1.6">
          <h2 style="color:#0a766f">Thanks for contacting Yesitech</h2>
          <p>Hello {html.escape(enquiry.name)},</p>
          <p>We have received your enquiry about <strong>{html.escape(enquiry.service)}</strong>
          and will respond within one business day.</p>
          <p>Regards,<br><strong>Yesitech Solutions</strong></p>
        </body></html>
        """,
        subtype="html",
    )

    # Prefer certifi when installed (needed by some Windows environments).
    # Linux hosts such as Render can safely use their system CA store.
    ca_file = certifi.where() if certifi is not None else None
    context = ssl.create_default_context(cafile=ca_file)
    smtp_class = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
    with smtp_class(host, port, timeout=20, context=context) if use_ssl else smtp_class(host, port, timeout=20) as smtp:
        if use_tls and not use_ssl:
            smtp.starttls(context=context)
        if username and password:
            smtp.login(username, password)
        smtp.send_message(company_message)
        smtp.send_message(confirmation)

    logger.info("Contact enquiry and customer confirmation emails sent successfully")
