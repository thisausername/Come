// src/pages/Chat.tsx

import React, { useEffect, useState, useRef } from 'react';
import { Container, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress, Box, Chip } from '@mui/material';
import { getChatHistory, ChatMessage, getOnlineCount } from '../api/chat';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const styles = {
  container: { mt: 4, mb: 4 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 },
  chatList: {
    height: '70vh',
    overflowY: 'auto',
    mb: 2,
    bgcolor: '#B9E5E8',
    borderRadius: 10,
    p: 1,
  },
  listItem: (isOwnMessage: boolean, isJoinOrLeave: boolean) => ({
    bgcolor: isJoinOrLeave ? 'secondary.main' : 'inherit',
    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
    display: 'flex',
  }),
  listItemText: (isOwnMessage: boolean, isMessage: boolean, isAnonymous: boolean) => ({
    color: isAnonymous ? 'grey' : 'text.primary',
    fontStyle: isMessage ? 'normal' : 'italic',
    bgcolor: isOwnMessage ? 'primary.light' : '#ffffff',
    borderRadius: 2,
    p: 1,
    maxWidth: '70%',
   '& .MuiListItemText-primary': {
      fontSize: '0.8rem',
      fontStyle: isMessage ? 'normal' : 'italic',
    },
    '& .MuiListItemText-secondary': {
      fontSize: '1rem',
      fontStyle: isMessage ? 'normal' : 'italic',
    },
  }),
  inputBox: { display: 'flex', flexDirection: 'column', gap: 1 },
  textField: { bgcolor: 'secondary.main', borderRadius: 1 },
  buttonBox: { display: 'flex', justifyContent: 'space-between' },
  noMessages: { p: 2, color: 'text.secondary' },
  loadingContainer: { mt: 4, textAlign: 'center' },
};

const getWebSocketUrl = (token: string) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/api/chatroom?token=${token}`;
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = token ? jwtDecode<{ user_id: number }>(token).user_id : null;

  useEffect(() => {
    let mounted = true;

    const fetchOnlineCount = async () => {
      try {
        const count = await getOnlineCount();
        if (mounted) setOnlineCount(count);
      } catch (err) {
        console.error('Failed to fetch online count:', err);
      }
    };

    const initChat = async () => {
      try {
        setLoading(true);
        const history = await getChatHistory();
        if (mounted && history !== null) {
          setMessages(history.map(msg => ({
            ...msg,
            timestamp: msg.timestamp * 1000,
          })));
        }

        const token = localStorage.getItem('token') || '';
        ws.current = new WebSocket(getWebSocketUrl(token));

        ws.current.onopen = () => {
          console.log('Connected to chat');
          if (mounted) {
            setLoading(false);
            fetchOnlineCount();
          }
        };
        ws.current.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          console.log('Received message:', msg);
          if (mounted) {
            setMessages((prev) => [...prev, {
              id: Date.now(),
              userId: parseInt(msg.userId, 10),
              username: msg.username,
              content: msg.content,
              timestamp: msg.timestamp * 1000,
              type: msg.type,
            }]);
            if (msg.type === 'join' || msg.type === 'leave') fetchOnlineCount();
          }
        };
        ws.current.onerror = (e) => {
          console.error('WebSocket error:', e);
          if (mounted) setError('Failed to connect to chat');
        };
        ws.current.onclose = () => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return (
    <Container maxWidth="md" sx={styles.loadingContainer}>
      <CircularProgress />
      <Typography>Loading chat...</Typography>
    </Container>
  );
  if (error) return <Container maxWidth="md" sx={styles.container}><Typography color="error">{error}</Typography></Container>;

  return (
    <Container maxWidth="md" sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h4" color="text.primary">Chat Room</Typography>
        <Chip label={`online: ${onlineCount}`} color="primary" />
      </Box>
      <List sx={styles.chatList}>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <ListItem
              key={msg.id}
              sx={styles.listItem(msg.userId === currentUserId, msg.type === 'join' || msg.type === 'leave')}
            >
              <ListItemText
                primary={
                  msg.type === 'message'
                    ? `${msg.username} ${new Date(msg.timestamp).toLocaleTimeString()}`
                    : msg.content
                }
                secondary={msg.type === 'message' ? msg.content : null}
                sx={styles.listItemText(msg.userId === currentUserId, msg.type === 'message', msg.userId === 0)}
              />
            </ListItem>
          ))
        ) : (
          <Typography sx={styles.noMessages}>No messages yet</Typography>
        )}
        <div ref={messagesEndRef} />
      </List>
      <Box sx={styles.inputBox}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          multiline
          minRows={2}
          maxRows={6}
          sx={styles.textField}
        />
        <Box sx={styles.buttonBox}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="contained" onClick={sendMessage}>Send</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Chat;
