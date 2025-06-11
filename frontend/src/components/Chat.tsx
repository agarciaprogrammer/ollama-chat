import { useState } from 'react';
import { sendPromptStream } from '../services/ollamaService';
import type { Message } from '../types/message';
import { MessageItem } from './Message';

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let streamedResponse = '';
    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      await sendPromptStream(trimmed, (chunk) => {
        streamedResponse += chunk;
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1
              ? { ...msg, content: streamedResponse }
              : msg
          )
        );
      });
    } catch {
      const error: Message = {
        role: 'assistant',
        content: 'Hubo un error al comunicarse con el modelo.',
      };
      setMessages((prev) => [...prev.slice(0, -1), error]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h1>Chatbot LL3</h1>

      <div className="message-list">
        {messages.map((msg, index) => (
          <MessageItem key={index} message={msg} />
        ))}
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={handleSend} disabled={isLoading} className="send-button">
          Enviar
        </button>
      </div>
    </div>
  );
};
