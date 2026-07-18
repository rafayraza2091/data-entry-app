'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AgentChatPage() {
  const [messages, setMessages] = useState<{role: 'user' | 'agent', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setRole(data.user?.role || data.role);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'agent', text: data.response || 'No response' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'agent', text: 'Error connecting to the agent.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center text-gray-500 mt-10">Verifying access...</div>;
  }

  if (role !== 'OWNER') {
    return (
      <div className="glass-panel max-w-lg mx-auto mt-20 p-8 text-center animate-slide-up">
        <div className="text-red-500 text-4xl mb-4"><i className="fa-solid fa-lock"></i></div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Access Denied</h2>
        <p className="text-gray-600">Only the Owner can access the Agent Assistant.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-slide-up flex flex-col flex-1 w-full mx-auto p-3 md:p-6">
      <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-6 text-primaryDark px-2">
        Agent Assistant
      </h2>
      
      <div 
        className="flex-1 overflow-y-auto mb-3 md:mb-4 flex flex-col gap-4 p-3 md:p-4 bg-gray-50/50 rounded-lg border border-gray-100 custom-scrollbar" 
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Hello! How can I assist you today?
          </div>
        )}
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`p-3 rounded-2xl max-w-[92%] md:max-w-[80%] break-words ${
              msg.role === 'user' 
                ? 'self-end bg-primary text-white rounded-br-none' 
                : 'self-start bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
            }`}
          >
            {msg.role === 'user' ? (
              msg.text
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse" {...props} /></div>,
                  th: ({node, ...props}) => <th className="p-2 border-b-2 border-gray-300 font-semibold bg-gray-100" {...props} />,
                  td: ({node, ...props}) => <td className="p-2 border-b border-gray-200" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-6 my-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-6 my-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <div className="mb-3 last:mb-0" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  code: ({node, inline, className, children, ...props}: any) => {
                    return inline ? (
                      <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-pink-600" {...props}>{children}</code>
                    ) : (
                      <pre className="bg-gray-800 text-white rounded-md p-4 overflow-x-auto my-3 text-sm"><code {...props}>{children}</code></pre>
                    );
                  }
                }}
              >
                {msg.text}
              </ReactMarkdown>
            )}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-white text-gray-500 border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3 mt-auto">
        <input 
          type="text" 
          className="form-control" 
          style={{ flex: 1, minWidth: '0' }}
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type your message..."
          disabled={loading}
        />
        <button 
          type="submit" 
          className="bg-primary text-white rounded-md font-semibold hover:bg-primaryDark transition-colors px-4 md:px-6 py-2 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shrink-0"
          disabled={loading}
        >
          <i className="fa-solid fa-paper-plane"></i> <span className="hidden md:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
