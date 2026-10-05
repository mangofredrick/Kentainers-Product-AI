import { runAgent } from "@/lib/ai/agent";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (searchParams.q || "").trim();

  if (!query) {
    return (
      <main style={shell}>
        <section style={card}>
          <div style={badge}>KENTAINERS AI SEARCH</div>
          <h1 style={title}>Kentainers Verified Search</h1>
          <p style={muted}>Search verified Kentainers product, technical and pricing knowledge.</p>
          <p style={hint}>Use a search such as <strong>10,000L Kentank installation</strong>.</p>
        </section>
      </main>
    );
  }

  const result = await runAgent(query);

  return (
    <main style={shell}>
      <div style={wrap}>
        <header style={header}>
          <div style={badgeLight}>KENTAINERS • VERIFIED AI SEARCH</div>
          <h1 style={{ margin: "12px 0 5px", fontSize: "clamp(28px,5vw,44px)" }}>Kentainers AI Search</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Answers are grounded in the verified Kentainers knowledge library.</p>
        </header>

        <section style={card}>
          <div style={label}>SEARCH</div>
          <div style={queryStyle}>{query}</div>

          <div style={answerBox}>
            <div style={label}>KENTAINERS ANSWER</div>
            <div style={answer}>{result.answer}</div>
          </div>

          {result.sources?.length ? (
            <div style={{ marginTop: 18 }}>
              <div style={label}>VERIFIED KNOWLEDGE SOURCES</div>
              <ul style={{ margin: "8px 0 0", paddingLeft: 20, color: "#48677D" }}>
                {result.sources.slice(0, 8).map((source, index) => (
                  <li key={`${source.document}-${source.page ?? ""}-${index}`} style={{ marginBottom: 5 }}>
                    {source.document}{source.page ? ` — page ${source.page}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div style={notice}>
            <strong>Verified-source policy:</strong> factual Kentainers answers are based only on approved Kentainers knowledge. External search data may identify questions, but it is not used as evidence for product answers.
          </div>

          <a href={`/?q=${encodeURIComponent(query)}`} style={button}>Continue in Kentainers Chatbot</a>
        </section>
      </div>
    </main>
  );
}

const shell = { minHeight: "100vh", background: "linear-gradient(160deg,#EAF6FB 0%,#fff 45%,#F2F8FC 100%)", padding: "28px 16px", fontFamily: "Arial, Helvetica, sans-serif", color: "#17324D" };
const wrap = { maxWidth: 980, margin: "0 auto" };
const header = { background: "linear-gradient(135deg,#002F5B 0%,#0066A1 65%,#00A3E0 100%)", color: "white", borderRadius: 22, padding: "28px 30px", boxShadow: "0 16px 40px rgba(0,47,91,.16)" };
const card = { marginTop: 16, background: "rgba(255,255,255,.98)", border: "1px solid #D7E7F0", borderRadius: 20, padding: 24, boxShadow: "0 12px 32px rgba(0,47,91,.08)" };
const badge = { display: "inline-block", padding: "7px 11px", borderRadius: 999, background: "#EAF6FB", color: "#0066A1", fontSize: 10, fontWeight: 900, letterSpacing: ".04em" };
const badgeLight = { display: "inline-block", padding: "7px 11px", borderRadius: 999, background: "rgba(255,255,255,.14)", fontSize: 10, fontWeight: 900, letterSpacing: ".04em" };
const title = { margin: "12px 0 6px", fontSize: 34 };
const muted = { color: "#64798A", lineHeight: 1.6 };
const hint = { marginTop: 18, padding: 12, borderRadius: 10, background: "#F6FBFE", color: "#48677D" };
const label = { fontSize: 10, fontWeight: 900, color: "#0066A1", letterSpacing: ".06em" };
const queryStyle = { marginTop: 8, padding: "13px 14px", border: "1px solid #D7E7F0", borderRadius: 10, background: "#F8FCFE", fontSize: 16, fontWeight: 700 };
const answerBox = { marginTop: 20, padding: 18, borderRadius: 14, background: "#EAF6FB", border: "1px solid #C9E5F2" };
const answer = { marginTop: 9, whiteSpace: "pre-wrap" as const, lineHeight: 1.65, fontSize: 15 };
const notice = { marginTop: 20, padding: 13, borderRadius: 11, background: "#FFF8E8", border: "1px solid #F0DFB1", color: "#66552D", fontSize: 12, lineHeight: 1.55 };
const button = { display: "inline-block", marginTop: 18, padding: "11px 15px", borderRadius: 10, background: "#002F5B", color: "white", textDecoration: "none", fontWeight: 900, fontSize: 13 };
