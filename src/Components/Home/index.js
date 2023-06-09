import { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../Context/userContext';
import { Navigate } from 'react-router-dom';
import { openai } from '../../Config/openaiconfig';
import { Loading } from '../Loading';

function Home() {
  const { currentUser, loading } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      content: "Hi, I'm Siddharth, how can I help you ?",
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
        content: "Hi, I'm Siddharth, how can I help you ?",
        role: "assistant"
      }
    ]);
  }
  return (
    <>
      {loading ? <Loading /> : (
        <div>
          {currentUser ?
            (
              <section className='container mx-auto p-0 pt-2 pb-2 fixed inset-0 mt-4'>
                <div className="mockup-window bg-base-300 w-full h-full flex flex-col">
                  <div className="p-0 pb-4 flex-grow overflow-auto" style={{ marginBottom: "20px" }}>
                    {messages.length && messages.map((msg, i) => {
                      return (
                        <div className={`chat ${msg.role === 'assistant' ? 'chat-start' : 'chat-end'}`} key={i}>
                          <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                              <img src={msg.role === 'assistant' ? '/images/apic.jpg' : '/images/bpic.jpg'} alt="" />
                            </div>
                          </div>
                          <div className={`chat-bubble  ${msg.role === 'assistant' ? 'bg-primary p-2 text-white bg-opacity-25' : 'bg-info p-2 text-white bg-opacity-25'}`} ref={messagesEndRef}>
                            <pre>
                              {msg.content}
                            </pre>
                          </div>
                        </div>
                      )
                    })
                    }
                  </div>
                  <form className='form-control p-0 items-center bg-transparent border-0 text-light' onSubmit={(e) => handleSubmit(e)}>
                    <div className="input-group max-w-full w-[1520px] relative">
                      {isTyping && <small className='absolute -top-6 left-1.5 animate-pulse'>Siddharth is typing...</small>}
                      <input type="text" placeholder='Type a question, ask anything!' autoresize="true" className='input input-bordered flex-grow p-2 mr-2 rounded-5' required />
                      <button className='btn btn-square mr-1 rounded-5' type='submit'>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                        </svg>
                      </button>
                      <button className='btn btn-danger rounded-5' type="button" onClick={(e) => handleRestart(e)}>
                        <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
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
      )}
</>
  );
}

export default Home;
