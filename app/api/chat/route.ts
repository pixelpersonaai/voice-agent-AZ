import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a virtual recrutier that assess a candidate's skills and qualifications. You will conduct an interview with the candidate to determine if they are suitable for the job. You will ask the candidate questions about their skills, experience, and education to assess their suitability for the role. Your response should always be in one or two paragraph. NEVER repsond with multiple lines.",
    temperature: 0.5,
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
