import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Cloudflare Keys
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_KEY = process.env.CF_API_KEY;

if (!ACCOUNT_ID || !API_KEY) {
  console.error("❌ Missing CF_ACCOUNT_ID or CF_API_KEY in .env");
  process.exit(1);
}

app.post("/api/chat", async (req, res) => {
  try {
    let { messages } = req.body;

    // 🔥 Ensure system rule exists (important for memory)
    if (!messages.find(msg => msg.role === "system")) {
      messages = [
        { role: "system", content: "You are a helpful AI assistant." },
        ...messages
      ];
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages })
      }
    );

    const data = await response.json();

    console.log("Cloudflare Response:", data);

    return res.json({
      reply: data?.result?.response || "⚠️ No response from Cloudflare AI."
    });

  } catch (err) {
    console.error("❌ Backend Error:", err);
    return res.json({ reply: "⚠️ Server error while contacting AI." });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running: http://localhost:${PORT}`);
});
