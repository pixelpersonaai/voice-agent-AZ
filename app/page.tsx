"use client";
import { Message, useChat } from "ai/react";
import {
  AudioLinesIcon,
  CircleUserIcon,
  MicIcon,
  Sparkles,
  SquareIcon,
} from "lucide-react";
import { useState } from "react";

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
          <div className="w-3/5 flex flex-col justify-center bg-white rounded-lg p-4 shadow-md">
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
                                  <button className="rounded-full bg-sky-100 p-2 text-white">
                                    <Sparkles
                                      className="text-blue-600"
                                      size={20}
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
          {/* Input */}
          <div className="h-fit w-[415px] flex flex-col justify-between items-end my-2">
            <div className="flex space-x-4">
              {recordingReady ? (
                <div className="flex items-center bg-blue-500 text-white rounded-lg px-4 font-bold w-[352px] h-[48px] text-blue-600 bg-white ">
                  <span className="flex justify-center items-center w-full text-gray-400">
                    <AudioLinesIcon size={24} />
                    <AudioLinesIcon size={24} />
                    <AudioLinesIcon size={24} />
                    <AudioLinesIcon size={24} />
                  </span>
                  <button
                    className="flex justify-end items-center p-0.5 border border-transparent  hover:border-red-500 hover:rounded-sm"
                    onClick={() => {
                      setRecordingReady((prev) => !prev);
                    }}
                  >
                    <SquareIcon
                      size={20}
                      className="bg-red-500 text-red-500 rounded-sm"
                    />
                  </button>
                </div>
              ) : (
                <button
                  className="bg-blue-500 bottom-0 inset-x-0 rounded-lg px-4 font-bold w-[352px] h-[48px] text-blue-500 bg-white hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    setRecordingReady((prev) => !prev);
                    setRecordingStared((prev) => !prev);
                  }}
                >
                  Speak to Agent
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
