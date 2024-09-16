"use client";
import { Message, useChat } from "ai/react";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    keepLastMessageOnError: true,
    onFinish: async (message: Message) => {},
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4E2F5B5] to-[#FFFFFFB5]">
      <div className="w-full flex flex-col items-center justify-center h-[58vh] overflow-y-grow pb-2 bg-yellow-200">
        {messages.map((message: Message, index: number) => {
          return (
            // Chat History
            <div key={message.id} className="flex flex-col gird grid-cols-8">
              {message.content
                .split("\n")
                .map((currentText: string, index: number) => {
                  if (currentText === "") {
                    return <p key={message.id}>&nbsp;&nbsp;&nbsp;</p>;
                  } else {
                    return (
                      <>
                        {message.role === "user" ? (
                          <div className="flex my-2 justify-end ">
                            <div
                              key={message.id + index}
                              className="bg-sky-100 text-sm text-blue-700 rounded-lg px-2 py-2 "
                            >
                              {currentText}
                            </div>
                            <div className="mx-2">
                              <button className="rounded-full">User</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex my-2 justify-start">
                            <div
                              key={message.id + index}
                              className="bg-blue-500 text-sm text-white px-2 py-2 rounded-lg "
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
  );
}
