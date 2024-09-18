import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const key = process.env.TTS_KEY;
  const region = process.env.TTS_REGION;

  const headers = {
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const tokenResponse = await axios.post(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      headers
    );
    return NextResponse.json({
      token: tokenResponse.data,
      region: region,
    });
  } catch (err) {
    return new NextResponse("An error occurred while authorizing the key.", {
      status: 401,
    });
  }
}
