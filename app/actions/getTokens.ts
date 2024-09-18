import axios from "axios";
import Cookies from "universal-cookie";

export async function getTokens() {
  const cookie = new Cookies();
  const speechToken = cookie.get("voiceToken");

  if (speechToken === undefined) {
    // Fetch token from server
    try {
      const res = await axios.get("/api/voiceToken");
      const token = res.data.token;
      const region = res.data.region;
      cookie.set("voiceToken", region + ":" + token, {
        maxAge: 1200,
        path: "/",
      });

      console.log("Token fetched: " + token);
      return { authToken: token, region: region };
    } catch (err) {
      console.log(err);
      return { authToken: null, error: err };
    }
  } else {
    // Use token from cookie
    console.log("Token from cookie: " + speechToken);
    const idx = speechToken.indexOf(":");
    return {
      authToken: speechToken.slice(idx + 1),
      region: speechToken.slice(0, idx),
    };
  }
}
