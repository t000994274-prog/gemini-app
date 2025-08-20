// netlify/functions/gemini.js
import fetch from "node-fetch";


export async function handler(event, context) {
try {
if (event.httpMethod !== "POST") {
return {
statusCode: 405,
body: JSON.stringify({ error: "Method not allowed" })
};
}


const { grade, text } = JSON.parse(event.body);
if (!text || !grade) {
return {
statusCode: 400,
body: JSON.stringify({ error: "grade と text を送信してください" })
};
}


const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
return {
statusCode: 500,
body: JSON.stringify({ error: "GEMINI_API_KEY が設定されていません" })
};
}


const prompt = `あなたは小学生の作文をやさしく評価する先生です。\n学年: ${grade}\n作文: ${text}\n
必ず次の JSON 形式で答えてください:\n{
"score": "S/A/B",
"evaluation": "評価理由（子どもにわかる言葉で3文程度）",
"encouragement": "応援コメント",
"next_step": "次の学習ステップ"
}`;


const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
contents: [
{ role: "user", parts: [{ text: prompt }] }
]
})
});


const data = await response.json();


if (!response.ok) {
return {
statusCode: response.status,
body: JSON.stringify({ error: data.error?.message || "Gemini API error" })
};
}


const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
let result;
try {
result = JSON.parse(textResponse);
} catch (err) {
return {
}