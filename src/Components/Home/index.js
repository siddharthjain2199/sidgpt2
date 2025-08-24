
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
  const textareaRef = useRef(null); // Step 1: new ref for textarea

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
  // Step 2: Adjust textarea height on inputText change (both typed and speech)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(150, textareaRef.current.scrollHeight) + "px";
    }
  }, [inputText]);
  // Split large text into chunks for display
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

    // Stop recognition temporarily
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }

    const newUserMessage = { content: userMessageText, role: "user" };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText(""); // Clear textarea

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
        generationConfig: {
          temperature: 0.7,
        },
        systemInstruction: {
          role: "system",
          parts: [
            {
              text: `Format answers in **short Markdown** with:
- Clear headings for topics and dont want anywhere "#"
- Bullet points for each key idea (✅, ⚡, 💡 icons)
- Always include ALL important points (do not skip any)
- Each point = valid 3 lines definition with short simple example
- Do NOT use collapsible sections, show everything directly
- at end please mention this and check that you have covered all point
- Keep responses complete but concise
- if code then try less commented line in code
- if i will ask explain code then only explain
- if ask difference then first give some descition and example and give table format difference
- Try to give answer in interview perspective`,
            },
          ],
        },
      });

      const aiResponseText = completion.response.text();
      addAssistantResponseFast(aiResponseText);
    } catch (error) {
      console.error("Gemini API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          content: "⚠️ Something went wrong. Please try again.",
          role: "assistant",
        },
      ]);
      setIsTyping(false);
    } finally {
      if (recognitionRef.current && listening) {
        recognitionRef.current.start();
      }
    }
  };

  const handleRestart = () => {
    setMessages([
      { content: "Hi, I'm Siddharth, how can I help you?", role: "assistant" },
    ]);
  };


  const handleCopy = async (code, idx) => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const renderMessageContent = (content) => {
    return content.split(/```/).map((block, idx) => {
      if (idx % 2 === 0) {
        const lines = block.split("\n").filter((line) => line.trim() !== "");
        const elements = [];

        let inTable = false;
        let tableLines = [];

        lines.forEach((line, i) => {
          line = line.trim();


          // Skip empty or single pipe lines
          if (line === "" || /^(\|?\s*\|?\s*)+$/.test(line)) {
            if (inTable && tableLines.length) {
              elements.push(renderTable(tableLines, idx + "-" + i));
              tableLines = [];
              inTable = false;
            }
            return;
          }

          // Detect table row only if it has multiple "|" and looks like table
          const pipeCount = (line.match(/\|/g) || []).length;
          if (pipeCount >= 2) {
            inTable = true;
            tableLines.push(line);
          } else {
            if (inTable && tableLines.length) {
              elements.push(renderTable(tableLines, idx + "-" + i));
              tableLines = [];
              inTable = false;
            }

            // Normal headings / bullet / paragraph rendering
            if (line.startsWith("##")) {
              elements.push(
                <h2 key={i} className="text-xl font-semibold mt-3 mb-2 text-blue-600">
                  {line.replace("##", "").trim()}
                </h2>
              );
            } else if (line.startsWith("#")) {
              elements.push(
                <h1 key={i} className="text-2xl font-bold mt-4 mb-3 text-indigo-700">
                  {line.replace("#", "").trim()}
                </h1>
              );
            } else if (line.startsWith("-") || line.startsWith("*")) {
              elements.push(
                <li key={i} className="ml-6 list-disc mb-1">
                  {line.replace(/^[-*]\s*/, "").trim()}
                </li>
              );
            } else {
              elements.push(
                <p key={i} className="mb-2 leading-relaxed">
                  {line}
                </p>
              );
            }
          }
        });

        // Render table if at end
        if (inTable && tableLines.length) {
          elements.push(renderTable(tableLines, idx + "-end"));
        }

        return <div key={idx}>{elements}</div>;
      } else {
        // code block (unchanged)
        let lang = "javascript";
        let code = block;
        const firstNewline = block.indexOf("\n");
        if (firstNewline !== -1) {
          const firstLine = block.substring(0, firstNewline).trim();
          if (/^[a-zA-Z]+$/.test(firstLine)) {
             // eslint-disable-next-line
            lang = firstLine; 
            code = block.substring(firstNewline + 1);
          }
        }
        return (
          <div key={idx} className="relative rounded-md">
            <button
              onClick={() => handleCopy(code, idx)}
              className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${copiedIndex === idx
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              {copiedIndex === idx ? "Copied" : "Copy"}
            </button>
            <SyntaxHighlighter language="javascript" style={oneDark}>
              {block}
            </SyntaxHighlighter>
          </div>
        );
      }
    });
  };


  const renderTable = (lines, key) => {
    if (!lines || lines.length < 2) return null;

    // Remove separator lines like | --- | --- |
    const cleanedLines = lines.filter((line) => !/^\s*\|?\s*-+\s*\|/.test(line));

    if (cleanedLines.length < 1) return null;

    // Combine multi-line cells into one line per row
    const rows = [];
    let currentRow = [];
    cleanedLines.forEach((line) => {
      const cells = line
        .split("|")
        .map((c) => c.replace(/\n/g, " ").trim())
        .filter((c) => c !== "");

      // If row is incomplete, merge with previous
      if (currentRow.length && cells.length < currentRow.length) {
        currentRow = currentRow.map((cell, idx) => cell + " " + (cells[idx] || ""));
      } else {
        if (currentRow.length) rows.push(currentRow);
        currentRow = cells;
      }
    });
    if (currentRow.length) rows.push(currentRow);

    // First row is header
    const headers = rows[0];
    const bodyRows = rows.slice(1);

    return (
      <div key={key} className="overflow-x-auto my-3">
        <table className="border border-black border-collapse w-full text-sm">
          <thead>
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="border border-black px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="border border-black px-3 py-2">
                    {cell.replace(/\|/g, "&#124;")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Mic / speech recognition
  const toggleMic = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        // Find the last result that is finalized (isFinal = true)
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript = event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText(finalTranscript);
        }
      };


      recognitionRef.current.onend = () => { };
    }

    try {
      if (listening) {
        recognitionRef.current.stop();
        setListening(false);
      } else {
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
            <div
              className="p-0 pb-4 flex-grow overflow-auto"
              style={{ marginBottom: "20px" }}
            >
              {messages.map((msg, i) => (
                <div
                  className={`chat ${msg.role === "assistant" ? "chat-start" : "chat-end"
                    }`}
                  key={i}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={
                          msg.role === "assistant"
                            ? "/images/apic.jpg"
                            : "/images/bpic.jpg"
                        }
                        alt={msg.role}
                      />
                    </div>
                  </div>
                  <div
                    className={`chat-bubble ${msg.role === "assistant"
                      ? "bg-primary p-2 text-white bg-opacity-25"
                      : "bg-info p-2 text-white bg-opacity-25"
                      }`}
                    ref={i === messages.length - 1 ? messagesEndRef : null}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))}
              {isTyping && (
                <small className="ml-2 animate-pulse text-white">
                  Siddharth is typing...
                </small>
              )}
            </div>

            <form
              className="form-control p-0 items-center bg-transparent border-0 text-light"
              onSubmit={handleSubmit}
            >
              <div className="mb-2 w-full flex justify-start">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="btn btn-danger rounded-5"
                >
                  Restart
                </button>
              </div>

              <div className="input-group max-w-full w-[1520px] relative flex items-center gap-2">
                <textarea
                  ref={textareaRef} // Step 1: assign ref here
                  rows={1}
                  placeholder="Type a question, ask anything!"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(150, e.target.scrollHeight) + "px";
                  }}
                  className="input input-bordered flex-grow p-2 rounded-5 resize-none overflow-hidden"
                  required
                />

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
