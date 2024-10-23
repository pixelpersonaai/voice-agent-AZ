"use client";
import { Message, useChat } from "ai/react";
import {
  AudioLinesIcon,
  CircleUserIcon,
  Sparkles,
  SquareIcon,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
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
        config.speechRecognitionLanguage = "en-US";

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
      keepLastMessageOnError: true,
      onFinish: async (message: Message) => {
        setAiResponseFinished(true);
        console.log("AI response finished");
      },
    });
  let speechToken: any;
  const [recordingReady, setRecordingReady] = useState(false);
  const [recordingStared, setRecordingStared] = useState(false);
  const [aiSpeakingDuration, setAiSpeakingDuration] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [aiResponseFinished, setAiResponseFinished] = useState(false);
  const [combinedTranscript, setCombinedTranscript] = useState("");
  const [recognizedTranscript, setRecognizedTranscript] = useState("");
  const [recognizingTranscript, setRecognizingTranscript] = useState("");
  const [speechSynthesizer, setSpeechSynthesizer] =
    useState<SpeechSynthesizer | null>(null);

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
      setAiResponseFinished(false);
      setRecordingReady(false);
      textToSpeech(messages[messages.length - 1]);
    } catch (error) {
      console.error("Error fetching starting message:", error);
    }
  };

  // Get Starting Messages
  const count = useRef(0);
  useEffect(() => {
    if (messages.length === 0 && count.current == 0) {
      startingMessage();
      setRecordingReady(true);
      count.current += 1;
    }
  }, [messages]);

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

  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  // Stop AI Speech
  const stopAISpeech = () => {
    console.log("Pause Pressed 1");
    console.log("AudioPlayer: ", audioPlayer);
    if (audioPlayer) {
      audioPlayer.pause();

      audioPlayer.currentTime = -1;

      setIsAISpeaking(false);
    }
  };

  const [isPaused, setIsPaused] = useState(false); // Flag to track whether speech is paused
  let currentChunkIndex = 0; // Track the current chunk being synthesized
  let chunks = []; // Store text chunks

  const splitTextIntoChunks = (text: string, maxLength = 500) => {
    // Regular expression to split text at punctuation (sentence enders and commas)
    const sentenceEnders = /([.!?])\s+/g;

    // Split the text into sentences based on punctuation marks
    let sentences = text.split(sentenceEnders).filter(Boolean); // Removes empty elements

    let currentChunk = "";

    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i];

      // If adding the current sentence exceeds the max length, push the current chunk
      if (currentChunk.length + sentence.length > maxLength) {
        chunks.push(currentChunk.trim()); // Add the current chunk to the chunks array
        currentChunk = sentence; // Start a new chunk with the current sentence
      } else {
        currentChunk += sentence + " "; // Add sentence to current chunk
      }
    }

    // Push the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
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

    speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";
    const synthesizer = new SpeechSynthesizer(speechConfig);
    setSpeechSynthesizer(synthesizer);

    // Split the message into smaller chunks
    const chunks = splitTextIntoChunks(message.content);

    const speakNextChunk = () => {
      if (isPaused || currentChunkIndex >= chunks.length) return;
    };

    synthesizer.speakTextAsync(
      chunks[currentChunkIndex],
      (result) => {
        currentChunkIndex++; // Move to next chunk

        if (currentChunkIndex < chunks.length && !isPaused) {
          speakNextChunk(); // Continue if not paused
        } else {
          synthesizer.close();
          setAiSpeakingDuration(result.audioDuration / 10000000);
          setIsAISpeaking(false); // Speech finished
        }
      },
      (error) => {
        console.log(error);
        synthesizer.close();
      }
    );

    // Start speaking
    speakNextChunk();

    return new Promise((resolve, reject) => {
      resolve("Speech synthesis started.");
    });

    // return new Promise((resolve, reject) => {
    //   synthesizer.speakTextAsync(
    //     message.content,
    //     (result) => {
    //       synthesizer.close();
    //       setAiSpeakingDuration(result.audioDuration / 10000000);
    //       setIsAISpeaking(true);
    //       resolve(result.audioData);
    //     },
    //     (error) => {
    //       console.log(error);
    //       synthesizer.close();
    //       reject(error);
    //     }
    //   );
    // });
  };

  const InterruptSpeech = () => {
    if (isPaused === false) {
      setIsPaused((prev) => !prev); // Toggle pause state
    }
  };

  // sensitivity (time it takes to auto upload the reconized transcript)
  const sensitivity = (currentText: string, index: number) => {
    if (index == 0 || index === messages.length - 1) {
      // wait 0.8 second
      const timer = setTimeout(() => {
        console.log("Timer Expired");
      }, 800);
      () => clearTimeout(timer);
      return currentText;
    } else {
      return currentText;
    }
  };

  // Dispaly the recognized text
  useEffect(() => {
    // dispatch the recognized text to the input field
    if (recognizingTranscript) {
      setCombinedTranscript(recognizedTranscript + recognizingTranscript);
      setInput(combinedTranscript);
      setLastUpdate(Date.now());
    }
  }, [recognizingTranscript, recognizedTranscript, handleInputChange]);

  // Automatically submit the form after 2 seconds of inactivity
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Submit only if the form is not empty and 2 seconds have passed
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdate;
      if (
        !aiResponseFinished &&
        timeSinceLastUpdate >= 2000 &&
        input.length > 0
      ) {
        setInput(combinedTranscript);
        handleSubmit();
        setRecognizedTranscript("");
        setCombinedTranscript("");
      }
      setLastUpdate(Date.now());
      setAiResponseFinished(false);
    }, 2000);

    // Clean up the timer
    return () => clearInterval(interval);
  }, [lastUpdate, aiResponseFinished]);

  return (
    <>
      {/* {interviewEnded ? (
        <div className="min-h-screen bg-gray-200 text-black font-normal w-full bg-slate-100 flex flex-col items-center justify-center overflow-y-auto pb-2">
          You have completed the interview. Our recruiter will review your your
          response and let you know the next steps.
        </div>
      ) : ( */}
      <div className="min-h-screen bg-white w-full bg-slate-100">
        {/*  */}
        <div className="w-full flex flex-col items-center justify-center h-[98vh] overflow-y-auto pb-2">
          <div className=" relative max-h-[50vh] w-3/5 flex flex-col justify-center bg-white rounded-lg shadow-md ">
            {messages.length > 0 && (
              <div className="absolute inset-0 p-4 bg-gradient-to-br from-pink-700 via-yellow-300 via-blue-500 to-purple-600 rounded-lg blur animate-pulse"></div>
            )}
            <div className="relative max-h-4/5 flex flex-col justify-center rounded-lg bg-white overflow-y-auto">
              {messages.map((message: Message, index: number) => {
                return (
                  // Chat History
                  <div
                    key={message.id}
                    className="flex flex-col gird grid-cols-8"
                  >
                    {message.content
                      .split("\n")
                      .map((currentText: string, lineIndex: number) => {
                        if (currentText === "") {
                          return (
                            <p key={`${message.id}-${lineIndex}`}>
                              &nbsp;&nbsp;&nbsp;
                            </p>
                          );
                        } else {
                          return (
                            <>
                              {message.role === "user" ? (
                                <div
                                  className="flex my-2 justify-end"
                                  key={`${message.id}+${lineIndex}`}
                                >
                                  <div className="bg-sky-100 text-sm text-blue-700 rounded-lg ml-12 px-2 py-1">
                                    {currentText}
                                  </div>
                                  <div className="mx-2">
                                    <button className="rounded-full bg-blue-500 p-1 text-white">
                                      <CircleUserIcon size={24} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="flex my-2 justify-start"
                                  key={`${message.id}-${lineIndex}`}
                                >
                                  <div className="mx-2">
                                    <button className="rounded-full bg-sky-100 p-1 text-white">
                                      <Sparkles
                                        className="text-blue-600 p-0.5"
                                        strokeWidth={2}
                                        size={22}
                                      />
                                    </button>
                                  </div>
                                  <div className="bg-blue-500 text-sm text-white mr-12 px-2 py-1 rounded-lg">
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
                      stopRecognition();
                      // stop the speech synthesis
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
                  className="bg-blue-500 bottom-0 inset-x-0 rounded-lg px-4 font-bold w-[352px] h-[48px] text-blue-500 bg-blue-100 hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    setRecordingReady((prev) => !prev);
                    setRecordingStared((prev) => !prev);
                    setAiResponseFinished(false);
                    handleButtonClick();
                  }}
                >
                  Click to Talk
                </button>
              )}
              <button
                className="bg-red-500 text-white rounded-lg font-bold h-[48px] w-[48px] flex items-center justify-center hover:bg-red-600"
                onClick={() => stopAISpeech()}
              >
                Stop
              </button>
            </div>
          </div>
        </div>

        <div className="w-full  flex flex-col items-center justify-center text-white font-semibold rounded-md">
          <div
            className={cn(
              "bg-transparent",
              input.length > 0 &&
                "bg-black bg-opacity-80 rouned-lg px-1 py-0.5 w-fit"
            )}
          >
            {input}
          </div>
        </div>
      </div>
      {/* )} */}
    </>
  );
}
