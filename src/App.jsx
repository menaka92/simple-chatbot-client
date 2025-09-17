import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'

const API_URL = "http://127.0.0.1:8000/chat"  // backend FastAPI endpoint

function App() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const newMessage = { sender: 'user', text: inputValue }
    setMessages((prev) => [...prev, newMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_body: newMessage.text
        })
      })

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)

      const data = await response.json()
      setMessages((prev) => [...prev, { sender: 'bot', text: data.message }])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [...prev, { sender: 'bot', text: '⚠️ Server error' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 text-lg font-bold flex items-center shadow-md">
        <Bot className="mr-2" /> AI Chatbot
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'bot' && (
              <div className="flex-shrink-0 mr-2">
                <Bot className="h-6 w-6 text-gray-600" />
              </div>
            )}
            <div
              className={`px-4 py-3 rounded-2xl shadow-sm max-w-xs sm:max-w-md ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="flex-shrink-0 ml-2">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <p className="text-gray-500 italic text-sm pl-2">Bot is typing...</p>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="bg-white p-4 flex items-center border-t shadow-inner">
        <textarea
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center shadow"
        >
          <Send className="mr-1 h-4 w-4" />
          Send
        </button>
      </footer>
    </div>
  )
}

export default App
