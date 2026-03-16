// AI Customer Sentiment Analyzer Script
document.addEventListener("DOMContentLoaded", function () {

    const feedbackInput = document.getElementById("feedback");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const resultBox = document.getElementById("resultBox");
    const sentimentSpan = document.getElementById("sentiment");
    const explanationSpan = document.getElementById("explanation");
    const errorMsg = document.getElementById("error");

    const GEMINI_API_KEY = "AIzaSyA4TI0hNCDqCze5hSw4BpHCLo0AojlVSOQ"; 
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    async function analyzeSentiment(text) {
        try {
            // Gemini truyền Key qua URL parameter ?key=
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Phân tích cảm xúc của phản hồi khách hàng sau và chỉ trả về duy nhất định dạng JSON như sau:
{"sentiment":"Positive|Negative|Neutral","explanation":"giải thích ngắn bằng tiếng Việt"}

Phản hồi: ${text}`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error("API error");
            }

            const data = await response.json();
            
            // Cấu trúc nhận kết quả từ Gemini
            let content = data.candidates[0].content.parts[0].text.trim();
            
            // Loại bỏ ký tự thừa nếu AI trả về định dạng Markdown (```json ... ```)
            content = content.replace(/```json|```/g, "").trim();
            
            const result = JSON.parse(content);

            return formatResult(result.sentiment, result.explanation);

        } catch (error) {
            console.warn("API lỗi → chuyển sang chế độ DEMO", error);
            return demoSentiment(text);
        }
    }
    function demoSentiment(text) {
        const lower = text.toLowerCase();
        let sentiment = "Neutral";
        let explanation = "Không xác định rõ cảm xúc.";

        if (lower.includes("tốt") || lower.includes("nhanh") || lower.includes("hài lòng") || 
            lower.includes("tuyệt") || lower.includes("great") || lower.includes("good")) {
            sentiment = "Positive";
            explanation = "Phản hồi có chứa từ ngữ tích cực.";
        }

        if (lower.includes("tệ") || lower.includes("chậm") || lower.includes("kém") || 
            lower.includes("không hài lòng") || lower.includes("bad") || lower.includes("terrible")) {
            sentiment = "Negative";
            explanation = "Phản hồi có chứa từ ngữ tiêu cực.";
        }

        return formatResult(sentiment, explanation);
    }

    function formatResult(sentiment, explanation) {
        let sentimentClass = "neutral";
        let sentimentText = "😐 Neutral";

        if (sentiment === "Positive") {
            sentimentClass = "positive";
            sentimentText = "😊 Positive";
        }
        if (sentiment === "Negative") {
            sentimentClass = "negative";
            sentimentText = "😡 Negative";
        }

        return {
            sentiment: sentimentText,
            explanation: explanation,
            class: sentimentClass
        };
    }

    analyzeBtn.addEventListener("click", async function () {
        const feedback = feedbackInput.value.trim();

        if (!feedback) {
            showError("Vui lòng nhập phản hồi của khách hàng.");
            return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = "🤖 AI đang phân tích...";
        errorMsg.textContent = "";
        resultBox.classList.add("hidden");

        try {
            const result = await analyzeSentiment(feedback);
            sentimentSpan.textContent = result.sentiment;
            explanationSpan.textContent = result.explanation;
            resultBox.className = `result-box ${result.class}`;
            resultBox.classList.remove("hidden");
        } catch (error) {
            showError("Không thể phân tích cảm xúc.");
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = "Analyze Sentiment";
        }
    });

    function showError(message) {
        errorMsg.textContent = message;
        resultBox.classList.add("hidden");
    }

    feedbackInput.addEventListener("input", function () {
        errorMsg.textContent = "";
    });
});
