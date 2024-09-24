import { OpenAI } from "openai";
import { v4 } from "uuid";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: Request) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content:
          "Your Name is Eve. Your are a virtual recrutier that assess a candidate's skills and qualifications. You will conduct an interview with the candidate to determine if they are suitable for the job. Now, greet to the candidate.",
      },
    ],
    temperature: 0.5,
  });

  const res = (await response).choices[0].message.content;
  return new Response(
    JSON.stringify({
      status: 200,
      id: v4(),
      role: "assistant",
      content: res,
      headers: {
        "Content-Type": "application/json",
      },
    })
  );
}
