'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users } from 'lucide-react';

const anonymousNames = [
  'Anonymous Owl', 'Mystery Student', 'Friendly Ghost', 'Secret Scholar', 
  'Hidden Helper', 'Quiet Questioner', 'Silent Sage', 'Unknown User',
  'Masked Mind', 'Invisible Intellect', 'Phantom Pupil', 'Covert Classmate'
];

export default function AnonymousChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [anonymousName, setAnonymousName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Generate random anonymous name on component mount
  useEffect(() => {
    const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
    setAnonymousName(randomName);
  }, []);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          anonymousName: anonymousName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      setNewMessage('');
      // Refresh messages to show the new one
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Anonymous School Chat</h1>
          </div>
          <p className="text-gray-600">Connect with fellow students anonymously</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>You are: <strong className="text-indigo-600">{anonymousName}</strong></span>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Be the first to start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-indigo-600">{message.anonymous_name}</span>
                    <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{message.content}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your anonymous message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>💡 Remember to be respectful and follow your school's guidelines</p>
        </div>
      </div>
    </div>
  );
}