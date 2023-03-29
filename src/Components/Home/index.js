import { useContext, useRef, useState } from 'react';
import { Configuration, OpenAIApi } from "openai";
import { AuthContext } from '../../Context/userContext';
import { Navigate } from 'react-router-dom';

const configuration = new Configuration({
  organization: "org-pApx96ATbGdkBSYJq4t0XWHd",
  apiKey: process.env.REACT_APP_OPENAI,
});
const openai = new OpenAIApi(configuration);

function Home() {
  const { currentUser } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      content: "Hi, I'm Wednesday Addams, how can I help you ?",
      role: "assistant"
    }
  ])

  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newMessage = {
      content: e.target[0].value,
      role: "user"
    }

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);
    e.target.reset();

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [...newMessages],
    });

    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    setMessages([...newMessages, completion.data.choices[0].message]);
    setIsTyping(false);
  }

  const handleRestart = (e) => {
    e.preventDefault();
    setMessages([
      {
        content: "Hi, I'm Wednesday Addams, how can I help you ?",
        role: "assistant"
      }
    ]);
  }

  return (
    <div>

      {currentUser ?
        (
          <section className='container mx-auto p-5 fixed inset-0 mt-4'>
            <div className="mockup-window bg-base-300 w-full h-full flex flex-col">
              <div className="p-5 pb-8 flex-grow overflow-auto">
                {
                  messages.length && messages.map((msg, i) => {
                    return (
                      <div className={`chat ${msg.role === 'assistant' ? 'chat-start' : 'chat-end'}`} key={i}>
                        <div className="chat-image avatar">
                          <div className="w-10 rounded-full">
                            <img src={msg.role === 'assistant' ? '/images/apic.png' : '/images/bpic.jpg'} alt="" />
                          </div>
                        </div>
                        <div className="chat-bubble" ref={messagesEndRef}>
                          {msg.content}
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <form className='form-control p-0 items-center bg-transparent border-0 text-light' onSubmit={(e) => handleSubmit(e)}>
                <div className="input-group max-w-full w-[800px] relative">
                  {isTyping && <small className='absolute -top-6 left-0.5 animate-pulse'>Wednesday is typing...</small>}
                  <input type="text" placeholder='Type a question for SidGPT, ask anything!' className='input input-bordered flex-grow' required />
                  <button className='btn btn-square mr-1' type='button'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                    </svg>
                  </button>
                  <button className='btn btn-danger' type="button" onClick={(e) => handleRestart(e)}>
                    <svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                    </svg>&nbsp;
                    Restart chat
                  </button>
                </div>
              </form>
            </div>
          </section>
        )
        : (
          <>
            <Navigate to="/login" />
          </>
        )}
    </div>

  );
}

export default Home;
