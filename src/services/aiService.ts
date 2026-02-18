const OPENROUTER_API_KEY = "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";

export const askGLM = async (prompt: string) => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
                "X-Title": "The Great Catch AI"
            },
            body: JSON.stringify({
                model: "z-ai/glm-5",
                messages: [
                    {
                        role: "system",
                        content: "Du är 'The Catch Whisperer', en expert på sportfiske. Din uppgift är att ge personliga, inspirerande och korta köpråd till kunder. Du ska använda informationen om dem och produkten för att förklara varför just detta drag/spö är perfekt för dem. Håll svaret på svenska, max 3 korta meningar, och var peppig!"
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Hoppsan, viskaren tappade tråden. Prova igen!";
    } catch (error) {
        console.error("AI Error:", error);
        return "Kunde inte kontakta viskaren just nu.";
    }
};
