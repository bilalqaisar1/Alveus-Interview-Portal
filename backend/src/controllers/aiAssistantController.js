import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const chatWithAssistant = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Messages must be an array" });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful career assistant for the Superio Job Portal. You help candidates with job searches, career advice, and interview preparation. Be professional, encouraging, and concise. Use markdown formatting (e.g., bolding, bullet points, numbered lists, and headers) to make your responses easy to read, similar to ChatGPT.",
                },
                ...messages,
            ],
        });

        res.status(200).json({
            message: response.choices[0].message,
        });
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ error: error.message });
    }
};
