"use client";
import { Message, useChat } from "ai/react";
import { CircleUserIcon, LogOutIcon, Sparkles } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import {
  AudioConfig,
  ResultReason,
  SpeechConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";

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
  const { messages, input, handleInputChange, handleSubmit } = useChat({
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
  });
  const [recordingReady, setRecordingReady] = useState(false);
  const [recordingStared, setRecordingStared] = useState(false);
  // get initial messages
  const initialMessage = async () => {
    try {
      const response = await fetch("/api/initialMessage", { method: "GET" });
      // Check if the response status is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // console.log("initialMessage: ", response);
      const data = await response.json();
      messages.push(data);
    } catch (error) {
      console.error("Error fetching initial message:", error);
    }
  };

  return (
    <>
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
                          return <p key={message.id}>&nbsp;&nbsp;&nbsp;</p>;
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
                className="flex justify-center text-sm items-center bg-white bottom-0 inset-x-0 rounded-lg px-4 font-semibold font-sans  h-[48px] text-blue-500 hover:bg-blue-500 hover:text-white"
                onClick={() => {
                  setRecordingReady((prev) => !prev);
                  setRecordingStared((prev) => !prev);
                }}
              >
                <LogOutIcon size={16} className="mr-2" /> End Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
