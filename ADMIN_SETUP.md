# Kentainers Admin Dashboard

The chatbot now includes a protected internal enquiry and lead dashboard at `/admin`.

## Vercel environment variable

Add this **server-side only** variable in Vercel Production:

```text
ADMIN_DASHBOARD_KEY=<long-random-secret>
```

Do not prefix it with `NEXT_PUBLIC_` and do not commit the value to GitHub.

Open:

```text
https://chatbot.kentainers.co.ke/admin
```

The dashboard provides:

- Total enquiries
- Enquiries in the last 24 hours and 7 days
- Identified customer leads
- Enquiry action breakdown
- Lead status breakdown
- 14-day enquiry activity
- Recent customer enquiries
- Lead status updates: open, contacted, qualified, converted, closed

The existing customer enquiry storage remains in PostgreSQL. Existing email settings are unchanged; dashboard functionality does not require changing the current office email configuration.
