import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

const Chat = ({ eventId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [canSend, setCanSend] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const connectWebSocket = () => {
    const token = localStorage.getItem('access_token');
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'}/chat/${eventId}/?token=${token}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'chat_history') {
          setMessages(data.messages.map(msg => ({
            id: msg.id,
            user: { id: msg.user_id, name: msg.username },
            message: msg.message,
            timestamp: new Date(msg.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
          })));
          setCanSend(data.can_send);
        } else if (data.type === 'chat_message') {
          setMessages(prev => [...prev, {
            id: prev.length,
            user: { id: data.user_id, name: data.username },
            message: data.message,
            timestamp: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
          }]);
        } else if (data.type === 'user_joined') {
          setActiveUsers(prev => {
            const users = prev.filter(u => u.id !== data.user_id);
            return [...users, {
              id: data.user_id,
              name: data.username,
              avatar: data.profile_picture
            }];
          });
        } else if (data.type === 'user_left') {
          setActiveUsers(prev => prev.filter(u => u.id !== data.user_id));
        } else if (data.type === 'typing_indicator') {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 1000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setConnected(false);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting (attempt ${reconnectAttempts.current})...`);
            connectWebSocket();
          }, delay);
        }
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setConnected(false);
    }
  };

  useEffect(() => {
    reconnectAttempts.current = 0;
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!messageText.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'chat_message',
      message: messageText.trim()
    }));

    setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing'
      }));
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {}, 1000);
  };

  const handleMessageChange = (e) => {
    setMessageText(e.target.value);
    handleTyping();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Event Chat</h3>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="chat-content">
        <div className="messages-section">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Be the first to start the conversation!</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.user?.id === user?.id ? 'own' : ''}`}>
                  <div className="message-avatar">
                    <span>{msg.user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <strong>{msg.user?.name || 'Anonymous'}</strong>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                    <p className="message-text">{msg.message}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  <p>Someone is typing...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {activeUsers.length > 0 && (
          <div className="active-users">
            <h4>Active Users ({activeUsers.length})</h4>
            <div className="users-list">
              {activeUsers.map(u => (
                <div key={u.id} className="user-badge">
                  <div className="user-badge-avatar">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} />
                    ) : (
                      <span>{u.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <span>{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-section">
        {!canSend && connected && (
          <div className="read-only-notice">
            <p>Only ticket holders can send messages</p>
          </div>
        )}
        <div className="chat-input-row">
          <textarea
            value={messageText}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={canSend ? "Type a message..." : "Only ticket holders can chat"}
            className="message-input"
            disabled={!connected || !canSend}
            rows="3"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !canSend || !messageText.trim()}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
