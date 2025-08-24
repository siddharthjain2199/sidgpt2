import { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../../Context/userContext";
import { Navigate } from "react-router-dom";
import { geminiModel } from "../../Config/geminiaiconfig";
import { Loading } from "../Loading";

// Syntax highlighter
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Mic icons
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

function Home() {
  const { currentUser, loading } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { content: "Hi, I'm Siddharth, how can I help you?", role: "assistant" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Split large text into chunks for display (no artificial delay)
  const splitIntoChunks = (text, chunkSize = 1000) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  };

  // Fast AI response rendering
  const addAssistantResponseFast = (aiResponseText) => {
    const paragraphs = aiResponseText
      .split("\n\n")
      .flatMap((p) => splitIntoChunks(p, 800));
    const combined = paragraphs.join("\n\n");
    setMessages((prev) => [...prev, { content: combined, role: "assistant" }]);
    setIsTyping(false);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e?.preventDefault();

    const userMessageText = inputText.trim();
    if (!userMessageText) return;

    // Stop recognition temporarily to prevent overwriting
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }

    const newUserMessage = { content: userMessageText, role: "user" };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText(""); // Clear textarea immediately

    setIsTyping(true);

    try {
      const formattedContents = [...messages, newUserMessage]
        .slice(-3)
        .map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));

      const completion = await geminiModel.generateContent({
        contents: formattedContents,
      });

      const aiResponseText = completion.response.text();
      addAssistantResponseFast(aiResponseText);
    } catch (error) {
      console.error("Gemini API error:", error);
      setMessages((prev) => [
        ...prev,
        { content: "Something went wrong. Please try again.", role: "assistant" },
      ]);
      setIsTyping(false);
    } finally {
      // Optionally restart mic if it was listening before
      if (recognitionRef.current && listening) {
        recognitionRef.current.start();
      }
    }
  };


  const handleRestart = () => {
    setMessages([{ content: "Hi, I'm Siddharth, how can I help you?", role: "assistant" }]);
  };

  // Render paragraphs + code blocks
  const renderMessageContent = (content) => {
    // Split by code blocks first
    return content.split(/```/).map((block, idx) => {
      if (idx % 2 === 0) {
        // Normal text → beautify headings, paragraphs, points
        const lines = block.split("\n").filter(line => line.trim() !== "");
        const elements = [];
        let listOpen = false;

        lines.forEach((line, i) => {
          line = line.trim();

          if (line.startsWith("##")) {
            if (listOpen) {
              elements.push("</ul>");
              listOpen = false;
            }
            elements.push(<h2 key={i} className="font-bold text-lg mt-2 mb-1">{line.replace("##", "").trim()}</h2>);
          } else if (line.startsWith("#")) {
            if (listOpen) {
              elements.push("</ul>");
              listOpen = false;
            }
            elements.push(<h1 key={i} className="font-bold text-xl mt-3 mb-2">{line.replace("#", "").trim()}</h1>);
          } else if (line.startsWith("-") || line.startsWith("*")) {
            if (!listOpen) {
              elements.push(<ul key={`ul-${i}`} className="ml-4 list-disc"></ul>);
              listOpen = true;
            }
            elements.push(
              <li key={i} className="mb-1">{line.replace(/^-/, "").replace(/^\*/, "").trim()}</li>
            );
          } else {
            if (listOpen) {
              elements.push("</ul>");
              listOpen = false;
            }
            elements.push(<p key={i} className="mb-2">{line}</p>);
          }
        });

        return <div key={idx}>{elements}</div>;
      } else {
        // Code block → keep as before
        const firstLineBreak = block.indexOf("\n");
        let lang = "javascript";
        let code = block;

        if (firstLineBreak !== -1) {
          const firstWord = block.substring(0, firstLineBreak).trim();
          if (firstWord) {
            lang = firstWord;
            code = block.substring(firstLineBreak + 1);
          }
        }

        const handleCopy = async () => {
          try {
            await navigator.clipboard.writeText(code.trim());
            setCopiedIndex(idx);
            setTimeout(() => setCopiedIndex(null), 2000);
          } catch (err) {
            console.error("Copy failed:", err);
          }
        };

        return (
          <div key={idx} className="relative">
            <button
              onClick={handleCopy}
              className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${copiedIndex === idx ? "bg-green-600 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              {copiedIndex === idx ? "Copied" : "Copy"}
            </button>
            <SyntaxHighlighter
              language={lang}
              style={oneDark}
              customStyle={{ borderRadius: "8px", padding: "12px", fontSize: "14px", marginTop: "8px" }}
            >
              {code.trim()}
            </SyntaxHighlighter>
          </div>
        );
      }
    });
  };


  // Mic / speech recognition
  const toggleMic = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // keep listening until manually stopped
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join("");
        setInputText(transcript);
      };

      recognitionRef.current.onend = () => {
        // DO NOT automatically restart
      };
    }

    try {
      if (listening) {
        recognitionRef.current.stop();
        setListening(false);
      } else {
        // Only start if not already running
        recognitionRef.current.start();
        setListening(true);
      }
    } catch (err) {
      console.warn("SpeechRecognition start error:", err);
    }
  };


  return (
    <>
      {loading ? (
        <Loading />
      ) : currentUser ? (
        <section className="container mx-auto p-0 pt-2 pb-2 fixed inset-0 mt-4">
          <div className="mockup-window bg-base-300 w-full h-full flex flex-col">
            <div className="p-0 pb-4 flex-grow overflow-auto" style={{ marginBottom: "20px" }}>
              {messages.map((msg, i) => (
                <div className={`chat ${msg.role === "assistant" ? "chat-start" : "chat-end"}`} key={i}>
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img src={msg.role === "assistant" ? "/images/apic.jpg" : "/images/bpic.jpg"} alt={msg.role} />
                    </div>
                  </div>
                  <div
                    className={`chat-bubble ${msg.role === "assistant" ? "bg-primary p-2 text-white bg-opacity-25" : "bg-info p-2 text-white bg-opacity-25"
                      }`}
                    ref={i === messages.length - 1 ? messagesEndRef : null}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))}
              {isTyping && <small className="ml-2 animate-pulse text-gray-500">Siddharth is typing...</small>}
            </div>

            <form className="form-control p-0 items-center bg-transparent border-0 text-light" onSubmit={handleSubmit}>
              {/* Restart button on the left */}
              <div className="mb-2 w-full flex justify-start">
                <button type="button" onClick={handleRestart} className="btn btn-danger rounded-5">
                  Restart
                </button>
              </div>

              {/* Input row: Textarea | Mic | Send */}
              <div className="input-group max-w-full w-[1520px] relative flex items-center gap-2">
                {/* Expandable textarea */}
                <textarea
                  rows={1}
                  placeholder="Type a question, ask anything!"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(150, e.target.scrollHeight) + "px";
                  }}
                  className="input input-bordered flex-grow p-2 rounded-5 resize-none overflow-hidden"
                  required
                />

                {/* Mic button */}
                <button
                  type="button"
                  onClick={toggleMic}
                  className="btn rounded-5 flex items-center justify-center p-2"
                  title={listening ? "Listening..." : "Start speaking"}
                >
                  {listening ? (
                    <FaMicrophoneSlash className="text-red-500 w-5 h-5" />
                  ) : (
                    <FaMicrophone className="text-green-500 w-5 h-5" />
                  )}
                </button>

                {/* Send button */}
                <button className="btn btn-square rounded-5" type="submit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                  </svg>
                </button>
              </div>
            </form>

          </div>
        </section>
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
}

export default Home;
