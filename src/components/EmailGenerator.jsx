import { useState } from "react";

const API_URL = "https://groq-email-backend.onrender.com/generate-emails";

const CARD_TITLES = [
  "1. Friendly Email",
  "2. Professional Email",
  "3. Sales Outreach Email",
  "4. Follow-up Email",
  "5. WhatsApp-Style Message",
  "6. Subject Line Options",
];

function stripHTML(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\n{3,}/g, "\n\n") // prevent too many blank lines
    .trim();
}

function processOutput(raw) {
  const regex = /(###\s*([^*\n]+)|\*\*(.*?)\*\*)\s*\n([\s\S]*?)(?=###|\*\*|$)/g;

  let match;
  let result = {};

  const mappingKeywords = {
    friendly: "1. Friendly Email",
    professional: "2. Professional Email",
    business: "2. Professional Email",
    sales: "3. Sales Outreach Email",
    outreach: "3. Sales Outreach Email",
    follow: "4. Follow-up Email",
    whatsapp: "5. WhatsApp-Style Message",
    short: "5. WhatsApp-Style Message",
    subject: "6. Subject Line Options",
    "line options": "6. Subject Line Options",
  };

  while ((match = regex.exec(raw)) !== null) {
    const heading = (match[2] || match[3] || "").trim().toLowerCase();
    const content = match[4].trim();
    let mappedKey = null;

    for (let keyword in mappingKeywords) {
      if (heading.includes(keyword)) {
        mappedKey = mappingKeywords[keyword];
      }
    }

    if (mappedKey) {
      result[mappedKey] = content;
    }
  }

  return {
    "1. Friendly Email": result["1. Friendly Email"] || "Not generated.",
    "2. Professional Email":
      result["2. Professional Email"] || "Not generated.",
    "3. Sales Outreach Email":
      result["3. Sales Outreach Email"] || "Not generated.",
    "4. Follow-up Email": result["4. Follow-up Email"] || "Not generated.",
    "5. WhatsApp-Style Message":
      result["5. WhatsApp-Style Message"] || "Not generated.",
    "6. Subject Line Options":
      result["6. Subject Line Options"] || "Not generated.",
  };
}

export default function EmailGenerator() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState({});
  const [showCards, setShowCards] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generate(e) {
    e.preventDefault();
    setShowCards(true);
    setLoading(true);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (data.success) setOutput(processOutput(data.output));

    setLoading(false);
  }

  const copyText = (text) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* WEBSITE TITLE */}

      {/* INPUT BOX */}
      <form onSubmit={generate} className="flex flex-col gap-4">
        <textarea
          className="w-full p-4 rounded-xl border shadow-sm focus:ring-2 focus:ring-black min-h-[130px] text-base"
          placeholder="Write your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full md:w-[200px] mx-auto bg-black text-white py-3 rounded-xl text-lg font-semibold flex justify-center items-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </button>
      </form>

      {/* OUTPUT CARDS */}
      {showCards && (
        <>
          {/* SUBJECT LINES FULL-WIDTH HORIZONTAL CARD */}
          <div className="bg-white rounded-xl p-5 shadow-lg border mt-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">6. Subject Line Options</h2>

              <button
                disabled={loading}
                onClick={() =>
                  copyText(output["6. Subject Line Options"] || "")
                }
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                Copy
              </button>
            </div>

            <div className="max-h-[200px] overflow-auto whitespace-pre-line text-sm leading-relaxed">
              {loading ? (
                <div className="flex justify-center items-center h-full py-6">
                  <span className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                </div>
              ) : (
                stripHTML(output["6. Subject Line Options"] || "Not generated.")
              )}
            </div>
          </div>

          {/* GRID FOR REMAINING 5 CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {CARD_TITLES.filter((t) => t !== "6. Subject Line Options").map(
              (title) => (
                <div
                  key={title}
                  className="bg-white rounded-xl p-5 shadow-lg border flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-lg">{title}</h2>

                    <button
                      disabled={loading}
                      onClick={() => copyText(output[title] || "")}
                      className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100 disabled:opacity-40"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="flex-1 max-h-[250px] overflow-auto whitespace-pre-line text-sm leading-relaxed">
                    {loading ? (
                      <div className="flex justify-center items-center h-full py-6">
                        <span className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                      </div>
                    ) : (
                      stripHTML(output[title] || "Not generated.")
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
