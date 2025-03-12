// src/pages/Chat.tsx

import React, { useEffect, useState, useRef } from 'react';
import { Container, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { getChatHistory, ChatMessage } from '../api/chat';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const initChat = async () => {
      try {
        setLoading(true);
        const history = await getChatHistory();
        if (mounted) {
          setMessages(history);
        }

        const token = localStorage.getItem('token') || '';
        ws.current = new WebSocket(`ws://localhost:8080/api/chat?token=${token}`);

        ws.current.onopen = () => {
          console.log('Connected to chat');
          if (mounted) setLoading(false);
        };
        ws.current.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (mounted) {
            setMessages((prev) => [...prev, {
              id: Date.now(),
              userId: msg.userId,
              username: msg.username,
              content: msg.content,
              createdAt: new Date(msg.timestamp * 1000).toISOString(),
            }]);
          }
        };
        ws.current.onerror = (e) => {
          console.error('WebSocket error:', e);
          if (mounted) setError('Failed to connect to chat');
        };
        ws.current.onclose = (e) => {
          console.log('Disconnected from chat:', e.code, e.reason);
          if (mounted) setError('Chat connection closed');
        };
      } catch (err) {
        console.error('Init chat error:', err);
        if (mounted) setError('Failed to load chat history');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      mounted = false;
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ content: input }));
      setInput('');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Loading chat...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Chat Room</Typography>
      <List sx={{ maxHeight: '400px', overflowY: 'auto', mb: 2 }}>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <ListItem key={msg.id}>
              <ListItemText
                primary={`${msg.username}: ${msg.content}`}
                secondary={new Date(msg.createdAt).toLocaleTimeString()}
                sx={{ color: msg.userId === 0 ? 'grey' : 'inherit' }}
              />
            </ListItem>
          ))
        ) : (
          <Typography>No messages yet</Typography>
        )}
        <div ref={messagesEndRef} />
      </List>
      <TextField
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
      />
      <Button variant="contained" onClick={sendMessage} sx={{ mt: 1 }}>Send</Button>
    </Container>
  );
};

export default Chat;

