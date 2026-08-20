import React, { useState } from "react";
import axios from "axios";
import { contactAPI, ContactEnquiry } from "../services/api";

export const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const enquiry: ContactEnquiry = { name: String(data.get("name") || ""), email: String(data.get("email") || ""), service: String(data.get("service") || ""), message: String(data.get("message") || "") };
    try {
      await contactAPI.sendEnquiry(enquiry);
      form.reset();
      setSent(true);
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
      setError(typeof detail === "string" ? detail : "We could not send your enquiry. Please try again.");
    } finally { setSending(false); }
  };

  return <div className="site-page contact-page"><section className="contact-hero">
    <div className="contact-intro"><span className="eyebrow"><span></span> START A CONVERSATION</span><h1>Let’s build something<br/><em>remarkable.</em></h1><p>Tell us what you’re working on, where you’re stuck or what you want to make possible. We’ll get back to you within one business day.</p><div className="contact-direct"><span>Prefer email?</span><a href="mailto:info@yesitech.com">info@yesitech.com ↗</a></div><div className="availability"><i></i><span><b>Now accepting new projects</b><small>Software · Data · Cloud · AI</small></span></div></div>
    <div className="contact-form-wrap">{sent ? <div className="success-message"><span>✓</span><h2>Thanks for reaching out.</h2><p>Your enquiry has been sent to our team. We’ll reply to your email within one business day.</p><button onClick={() => setSent(false)} className="button button-dark">Send another message</button></div> : <form onSubmit={submit}><div className="form-heading"><small>PROJECT ENQUIRY</small><span>All fields marked * are required</span></div><label>Your name *<input required minLength={2} maxLength={100} name="name" placeholder="Jane Smith" /></label><label>Work email *<input required type="email" name="email" placeholder="jane@company.com" /></label><label>What can we help with? *<select required name="service" defaultValue=""><option value="" disabled>Select a service</option><option>AI & intelligent systems</option><option>Custom software development</option><option>Data engineering & migration</option><option>Cloud & DevOps</option><option>Training & technical support</option></select></label><label>Tell us a little about your project *<textarea required minLength={10} maxLength={5000} name="message" rows={4} placeholder="The challenge, your goals, and any important context..." /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark" type="submit" disabled={sending}>{sending ? "Sending enquiry…" : <>Send enquiry <span>↗</span></>}</button><p className="form-note">By submitting, you agree that we may contact you about your enquiry.</p></form>}</div>
  </section></div>;
};
