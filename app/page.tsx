"use client";
import { Message, useChat } from "ai/react";
import { CircleUserIcon, LogOutIcon, Sparkles } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  AudioConfig,
  ResultReason,
  SpeechConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { cn } from "@/lib/utils";
import { getTokens } from "./actions/getTokens";

type SetRecognizedTranscript = Dispatch<SetStateAction<string>>;
type SetRecognizingTranscript = Dispatch<SetStateAction<string>>;

const useSpeechRecognition = (
  setRecognizedTranscript: SetRecognizedTranscript,
  setRecognizingTranscript: SetRecognizingTranscript
) => {
  const [speechRecognizer, setSpeechRecognizer] =
    useState<SpeechRecognizer | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [speechConfig, setSpeechConfig] = useState<SpeechConfig | null>(null);

  useEffect(() => {
    const initializeSpeechSDK = async () => {
      try {
        const { authToken, region } = await getTokens();
        const config = SpeechConfig.fromAuthorizationToken(authToken, region);
        config.speechRecognitionLanguage = "zh-CN";

        setSpeechConfig(config);

        // Initialize the AudioContext here in response to a user gesture (button click)
        const context = new AudioContext();
        setAudioContext(context);

        const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechRecognizer(config, audioConfig);

        recognizer.recognizing = (
          _: any,
          event: { result: { reason: any; text: string } }
        ) => {
          // Handle recognizing event
          setRecognizingTranscript(event.result.text);
        };

        recognizer.recognized = (
          _: any,
          event: { result: { reason: any; text: string } }
        ) => {
          if (event.result.reason === ResultReason.RecognizedSpeech) {
            // Update the state with the recognized speech
            setRecognizedTranscript((prev) => prev + " " + event.result.text);
          }
        };

        setSpeechRecognizer(recognizer);
      } catch (error) {
        console.error("Error initializing Speech SDK:", error);
      }
    };

    initializeSpeechSDK();
  }, [setRecognizedTranscript]);

  // Start speech recognition
  const handleButtonClick = async () => {
    try {
      if (speechConfig && audioContext) {
        if (!audioContext.state || audioContext.state === "suspended") {
          await audioContext.resume();
        }

        // Start the Speech SDK recognition when the AudioContext is ready
        const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizing = (_, event) => {
          // Handle recognizing event
          console.log(event.result.text);
          setRecognizingTranscript(event.result.text);
        };

        recognizer.recognized = (_, event) => {
          if (event.result.reason === ResultReason.RecognizedSpeech) {
            // Update the state with the recognized speech
            setRecognizedTranscript((prev) => prev + " " + event.result.text);
            setRecognizingTranscript("");
          }
        };

        recognizer.startContinuousRecognitionAsync();

        setSpeechRecognizer(recognizer);
      }
    } catch (error) {
      console.error("Error handling button click:", error);
    }
  };

  // Stop speech recognition
  const stopRecognition = () => {
    if (speechRecognizer) {
      speechRecognizer.stopContinuousRecognitionAsync();
      setSpeechRecognizer(null);
    }
  };

  return { handleButtonClick, stopRecognition };
};

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, setInput } =
    useChat({
      initialMessages: [
        {
          id: "1",
          role: "system",
          content:
            "You are a helpful assistant that translates English to French.",
        },
        {
          id: "2",
          role: "user",
          content: "Hello, how are you doing?",
        },
        {
          id: "3",
          role: "assistant",
          content: "Bonjour, comment allez-vous?",
        },
        {
          id: "4",
          role: "user",
          content: "I'm doing well, thank you. How are you?",
        },
        {
          id: "5",
          role: "assistant",
          content: "Je vais bien, merci. Comment allez-vous?",
        },
      ],
      keepLastMessageOnError: true,
      onFinish: async (message: Message) => {
        setAiResponseFinished(true);
        console.log("AI response finished");
      },
    });
  let speechToken: any;
  const [interviewEnded, setInterviewEnded] = useState(true);
  const [startInterview, setStartInterview] = useState(false);
  const [endInterview, setEndInterview] = useState(false);
  const [recordingReady, setRecordingReady] = useState(false);
  const [recordingStared, setRecordingStared] = useState(false);
  const [aiSpeakingDuration, setAiSpeakingDuration] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [aiResponseFinished, setAiResponseFinished] = useState(false);
  const [combinedTranscript, setCombinedTranscript] = useState("");
  const [recognizedTranscript, setRecognizedTranscript] = useState("");
  const [recognizingTranscript, setRecognizingTranscript] = useState("");

  const { handleButtonClick, stopRecognition } = useSpeechRecognition(
    setRecognizedTranscript,
    setRecognizingTranscript
  );

  // get starting messages
  const startingMessage = async () => {
    try {
      const response = await fetch("/api/startingMessage", { method: "GET" });
      // Check if the response status is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // console.log("startingMessage: ", response);
      const data = await response.json();
      messages.push(data);
    } catch (error) {
      console.error("Error fetching starting message:", error);
    }
  };

  // Text to Speech
  const textToSpeech = async (message: Message) => {
    if (!speechToken) {
      const tokenObj = await getTokens();
      if (tokenObj) {
        console.log("tokenObj: ", tokenObj);
        speechToken = tokenObj;
      }
    }

    const speechConfig = SpeechConfig.fromAuthorizationToken(
      speechToken.authToken,
      speechToken.region
    );

    speechConfig.speechSynthesisVoiceName = "EN-US-AriaNeural";
    const speechSynthesizer = new SpeechSynthesizer(speechConfig);

    speechSynthesizer.speakTextAsync(
      message.content,
      (result) => {
        speechSynthesizer.close();
        // console.log("Play Time：", result.audioDuration / 10000000);
        setAiSpeakingDuration(result.audioDuration / 10000000);
        setIsAISpeaking(true);
        return result.audioData;
      },
      (error) => {
        console.log(error);
        speechSynthesizer.close();
      }
    );
  };

  // Trigger text to speech
  useEffect(() => {
    if (aiResponseFinished && messages.length > 0) {
      if (messages[messages.length - 1].role === "assistant") {
        textToSpeech(messages[messages.length - 1]);
        const timer = setTimeout(() => {
          setIsAISpeaking(false);
        }, aiSpeakingDuration);
        return () => {
          setIsAISpeaking(false);
          clearTimeout(timer);
          setIsAISpeaking(false);
        };
      }
    }
    console.log(messages);
  }, [aiResponseFinished]);

  // Automatically submit the form after 2 seconds of inactivity
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Submit only if the form is not empty and 2 seconds have passed
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdate;
      if (
        !aiResponseFinished &&
        timeSinceLastUpdate >= 2500 &&
        input.length > 0
      ) {
        setInput(combinedTranscript);
        handleSubmit();
        setRecognizedTranscript("");
        setCombinedTranscript("");
      }
      setLastUpdate(Date.now());
      setAiResponseFinished(false);
    }, 2500);

    // Clean up the timer
    return () => clearInterval(interval);
  }, [lastUpdate, aiResponseFinished]);

  return (
    <>
      {interviewEnded ? (
        <div className="min-h-screen bg-gray-200 text-black font-normal w-full bg-slate-100 flex flex-col items-center justify-center overflow-y-auto pb-2">
          You have completed the interview. Our recruiter will review your your
          response and let you know the next steps.
        </div>
      ) : (
        <div className="min-h-screen bg-white w-full bg-slate-100">
          {/*  */}
          <div className="w-full flex flex-col items-center justify-center h-[98vh] overflow-y-auto pb-2">
            <div className="relative w-3/5 flex flex-col justify-center bg-white rounded-lg shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-700 via-yellow-300 via-blue-500 to-purple-600 rounded-lg blur animate-pulse"></div>
              <div className="relative flex flex-col justify-center rounded-lg bg-white">
                {messages.map((message: Message, index: number) => {
                  return (
                    // Chat History
                    <div
                      key={message.id}
                      className="flex flex-col gird grid-cols-8"
                    >
                      {message.content
                        .split("\n")
                        .map((currentText: string, index: number) => {
                          if (currentText === "") {
                            return (
                              <p key={index + message.id}>&nbsp;&nbsp;&nbsp;</p>
                            );
                          } else {
                            return (
                              <>
                                {message.role === "user" ? (
                                  <div className="flex my-2 justify-end">
                                    <div
                                      key={message.id + index}
                                      className="bg-sky-100 text-sm text-blue-700 rounded-lg ml-12 px-2 py-1"
                                    >
                                      {currentText}
                                    </div>
                                    <div className="mx-2">
                                      <button className="rounded-full bg-blue-500 p-1 text-white">
                                        <CircleUserIcon size={24} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex my-2 justify-start">
                                    <div className="mx-2">
                                      <button className="rounded-full bg-sky-100 p-1 text-white">
                                        <Sparkles
                                          className="text-blue-600 p-0.5"
                                          strokeWidth={2}
                                          size={22}
                                        />
                                      </button>
                                    </div>
                                    <div
                                      key={message.id + index}
                                      className="bg-blue-500 text-sm text-white mr-12 px-2 py-1 rounded-lg"
                                    >
                                      {currentText}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          }
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Input */}
            <div className="h-fit w-[415px] flex flex-col justify-between items-end my-2">
              <div className="w-full flex justify-center items-center">
                <button
                  className={cn(
                    "flex justify-center text-sm items-center bg-blue-500 bottom-0 inset-x-0 rounded-lg px-4 font-semibold font-sans h-[48px] text-white",
                    !startInterview &&
                      "bg-blue-500 hover:bg-blue-600 hover:text-white",
                    startInterview &&
                      "bg-red-500 hover:bg-red-600 hover:text-white"
                  )}
                  onClick={() => {
                    setRecordingReady((prev) => !prev);
                    setRecordingStared((prev) => !prev);
                    if (startInterview) {
                      setEndInterview((prev) => !prev);
                    } else {
                      setStartInterview((prev) => !prev);
                    }
                    handleButtonClick();
                  }}
                >
                  <LogOutIcon size={16} className="mr-2" />{" "}
                  {recordingStared ? "End" : "Start"} {"Interview"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
