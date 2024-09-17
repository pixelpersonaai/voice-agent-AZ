"use client";
import { Message, useChat } from "ai/react";
import {
  AudioLinesIcon,
  CircleUserIcon,
  LogOutIcon,
  MicIcon,
  Sparkles,
  SquareIcon,
} from "lucide-react";
import { useState } from "react";
import {
  AudioConfig,
  ResultReason,
  SpeechConfig,
  SpeechRecognizer,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";

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

  return (
    <>
      <div className="min-h-screen bg-white w-full bg-slate-100">
        {/*  */}
        <div className="w-full flex flex-col items-center justify-center h-[98vh] overflow-y-auto pb-2">
          <div className="relative w-3/5 flex flex-col justify-center bg-white rounded-lg shadow-md">
            <div className="absolute inset-0 m-0.5 bg-gradient-to-br from-pink-300 via-yellow-300 via-blue-500 to-purple-600 rounded-lg blur"></div>
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
                                    className="bg-sky-100 text-sm text-blue-700 rounded-lg px-2 py-1"
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
                                    className="bg-blue-500 text-sm text-white px-2 py-1 rounded-lg"
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
