import type { AgentResult } from "./types";
import type { CustomerDetails } from "./customer-enquiries";

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export async function sendCustomerEnquiryEmail(customer: CustomerDetails, question: string, result: AgentResult, enquiryId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.KPIA_OFFICE_EMAIL;
  const from = process.env.KPIA_FROM_EMAIL;
  if (!apiKey || !to || !from) throw new Error("Email notification environment variables are not configured");

  const sourceText = (result.sources || []).map((s) => `${s.document}${s.page ? `, p.${s.page}` : ""}`).join(" • ") || "No source recorded";
  const subject = `New Kentainers Chatbot Enquiry ${enquiryId}`;
  const text = [
    "New customer enquiry received from the Kentainers Product Chatbot.",
    `Enquiry ID: ${enquiryId}`,
    `Customer name: ${customer.name?.trim() || "Not provided"}`,
    `Customer email: ${customer.email?.trim() || "Not provided"}`,
    `Customer phone: ${customer.phone?.trim() || "Not provided"}`,
    "",
    `Question: ${question}`,
    "",
    `Chatbot answer: ${result.answer}`,
    `Action: ${result.action || "Not specified"}`,
    `Sources: ${sourceText}`
  ].join("\n");

  const html = `<h2>New Kentainers Chatbot Enquiry</h2><p><strong>Enquiry ID:</strong> ${escapeHtml(enquiryId)}</p><p><strong>Customer name:</strong> ${escapeHtml(customer.name?.trim() || "Not provided")}</p><p><strong>Customer email:</strong> ${escapeHtml(customer.email?.trim() || "Not provided")}</p><p><strong>Customer phone:</strong> ${escapeHtml(customer.phone?.trim() || "Not provided")}</p><hr/><p><strong>Question</strong></p><p>${escapeHtml(question).replaceAll("\n", "<br/>")}</p><p><strong>Chatbot answer</strong></p><p>${escapeHtml(result.answer).replaceAll("\n", "<br/>")}</p><p><strong>Action:</strong> ${escapeHtml(result.action || "Not specified")}</p><p><strong>Sources:</strong> ${escapeHtml(sourceText)}</p>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text, html })
  });
  if (!response.ok) throw new Error(`Customer enquiry email failed: ${response.status}`);
}
