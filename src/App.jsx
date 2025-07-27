import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  ListItemButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Badge,
  MenuItem,
  Fab,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Popover
} from '@mui/material';
import './App.css';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');

// Simple icon components using Unicode characters
const SendIcon = () => <span style={{ fontSize: '20px' }}>➤</span>;
const GroupIcon = () => <span style={{ fontSize: '20px' }}>👥</span>;
const PersonIcon = () => <span style={{ fontSize: '20px' }}>👤</span>;
const AddIcon = () => <span style={{ fontSize: '20px' }}>➕</span>;
const ChatIcon = () => <span style={{ fontSize: '20px' }}>💬</span>;
const LogoutIcon = () => <span style={{ fontSize: '20px' }}>🚪</span>;
const DeleteIcon = () => <span style={{ fontSize: '16px', color: '#f44336' }}>🗑️</span>;
const EmojiIcon = () => <span style={{ fontSize: '20px' }}>😊</span>;

const AI_ASSISTANT_URL = import.meta.env.VITE_AI_ASSISTANT_URL || 'https://rishigpt.streamlit.app/';

const App = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatType, setChatType] = useState('group'); // 'group' or 'private'
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showAccountSelection, setShowAccountSelection] = useState(true);
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('guest'); // 'guest' or 'master'
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);

  const handleAIAssistant = () => {
    window.open(AI_ASSISTANT_URL, '_blank');
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    setEmojiAnchorEl(null);
  };

  const handleEmojiButtonClick = (event) => {
    setEmojiAnchorEl(event.currentTarget);
    setShowEmojiPicker(true);
  };

  const emojis = [
    '😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🤔', '😭', '😎',
    '😡', '😱', '😴', '🤗', '😇', '😋', '😘', '😉', '😅', '😆',
    '😄', '😃', '😀', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢'
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
  socket.on('connect', () => {
    console.log('Connected to server');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      console.log('Connection error');
      setConnectionStatus('error');
    });

    socket.on('user_list_updated', (userList) => {
      setUsers(userList);
    });

    socket.on('room_joined', (roomData) => {
      setCurrentRoom(roomData.roomName);
      setMessages(roomData.messages);
      setChatType('group');
      setCurrentChat(null);
    });

    socket.on('new_group_message', (message) => {
      if (currentRoom === message.roomName) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('new_private_message', (message) => {
      if (currentChat && 
          ((message.senderId === currentChat.userId && message.recipientId === user?.userId) ||
           (message.recipientId === currentChat.userId && message.senderId === user?.userId))) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('private_message_sent', (message) => {
      if (currentChat && 
          ((message.senderId === currentChat.userId && message.recipientId === user?.userId) ||
           (message.recipientId === currentChat.userId && message.senderId === user?.userId))) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('private_chat_history', (chatData) => {
      setMessages(chatData.messages);
      setCurrentChat({ userId: chatData.otherUserId });
      setChatType('private');
      setCurrentRoom(null);
    });

    socket.on('user_typing', (data) => {
      if (currentRoom === data.roomName) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
      }
    });

    socket.on('user_stopped_typing', (data) => {
      if (currentRoom === data.roomName) {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      }
    });

    socket.on('user_joined_room', (data) => {
      console.log(`${data.username} joined ${data.roomName}`);
    });

    socket.on('user_left_room', (data) => {
      console.log(`${data.username} left ${data.roomName}`);
    });

    socket.on('room_created', (roomData) => {
      console.log('Room created event received:', roomData);
      setRooms(prev => {
        // Check if room already exists to prevent duplicates
        const roomExists = prev.some(room => room.name === roomData.name);
        if (roomExists) {
          console.log('Room already exists, skipping duplicate:', roomData.name);
          return prev;
        }
        console.log('Adding new room to state:', roomData.name);
        return [...prev, roomData];
      });
    });

    socket.on('room_deleted', (data) => {
      setRooms(prev => prev.filter(room => room.name !== data.roomName));
      if (currentRoom === data.roomName) {
        setCurrentRoom(null);
        setMessages([]);
      }
    });

    socket.on('room_deleted_notification', (data) => {
      alert(data.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('user_list_updated');
      socket.off('room_joined');
      socket.off('new_group_message');
      socket.off('new_private_message');
      socket.off('private_message_sent');
      socket.off('private_chat_history');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('user_joined_room');
      socket.off('user_left_room');
      socket.off('room_created');
      socket.off('room_deleted');
      socket.off('room_deleted_notification');
    };
  }, [currentRoom, currentChat, user]);

  const handleLogin = () => {
    if (username.trim()) {
      const userId = Date.now().toString();
      const userData = { 
        username: username.trim(), 
        userId
      };
      setUser(userData);
      socket.emit('user_login', userData);
      
      // Check if user is admin (username contains 'admin')
      setIsAdmin(username.toLowerCase().includes('admin'));
      setIsMaster(false);
      setAccountType('guest');
      
      // Fetch existing rooms
      fetch('http://localhost:3000/api/rooms')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch rooms');
          }
          return response.json();
        })
        .then(data => setRooms(data))
        .catch(error => {
          console.error('Error fetching rooms:', error);
          // Set empty array if fetch fails
          setRooms([]);
        });
    }
  };

  const handleMasterLogin = () => {
    if (username.toLowerCase() === 'd.snuts' && password === 'Master@ChatBay2024!') {
      const userId = Date.now().toString();
      const userData = { 
        username: 'D.Snuts', 
        userId,
        isMaster: true
      };
      setUser(userData);
      socket.emit('user_login', userData);
      
      setIsMaster(true);
      setIsAdmin(false);
      setAccountType('master');
      setShowLoginDialog(false);
      setShowAccountSelection(false);
      setPassword('');
      setUsername('');
      
      // Fetch existing rooms
      fetch('http://localhost:3000/api/rooms')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch rooms');
          }
          return response.json();
        })
        .then(data => setRooms(data))
        .catch(error => {
          console.error('Error fetching rooms:', error);
          setRooms([]);
        });
    } else {
      alert('Incorrect username or password!');
    }
  };

  const handleAccountSelection = (type) => {
    setAccountType(type);
    setShowAccountSelection(false);
    if (type === 'master') {
      setShowLoginDialog(true);
    }
  };

  const handleBackToSelection = () => {
    setShowAccountSelection(true);
    setShowLoginDialog(false);
    setUsername('');
    setPassword('');
  };

  const handleJoinRoom = (roomName) => {
    socket.emit('join_room', { roomName, userId: user.userId });
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: newRoomName.trim(), createdBy: user.userId })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create room');
        }
        return response.json();
      })
      .then((data) => {
        // Room will be added to state via the 'room_created' socket event
        handleJoinRoom(newRoomName.trim());
        setNewRoomName('');
        setShowCreateRoom(false);
      })
      .catch(error => {
        console.error('Error creating room:', error);
        alert('Failed to create room. Please try again.');
      });
    }
  };

  const handleDeleteRoom = (roomName) => {
    if (window.confirm(`Are you sure you want to delete the group "${roomName}"? This action cannot be undone.`)) {
      fetch(`http://localhost:3000/api/rooms/${encodeURIComponent(roomName)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deletedBy: user.userId,
          isMaster: isMaster,
          username: user.username
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete room');
        }
        return response.json();
      })
      .then(() => {
        // Remove room from local state
        setRooms(prev => prev.filter(room => room.name !== roomName));
        // If currently in the deleted room, leave it
        if (currentRoom === roomName) {
          setCurrentRoom(null);
          setMessages([]);
        }
      })
      .catch(error => {
        console.error('Error deleting room:', error);
        alert('Failed to delete room. Please try again.');
      });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      if (chatType === 'group' && currentRoom) {
        socket.emit('group_message', {
          roomName: currentRoom,
          message: newMessage.trim(),
          userId: user.userId
        });
      } else if (chatType === 'private' && currentChat) {
        socket.emit('private_message', {
          recipientId: currentChat.userId,
          message: newMessage.trim(),
          senderId: user.userId
        });
      }
      setNewMessage('');
    }
  };

  const handlePrivateChat = (otherUser) => {
    if (otherUser.userId !== user.userId) {
      socket.emit('get_private_chat', {
        otherUserId: otherUser.userId,
        userId: user.userId
      });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      if (currentRoom) {
        socket.emit('typing_start', { roomName: currentRoom, userId: user.userId });
      }
    }
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      if (currentRoom) {
        socket.emit('typing_stop', { roomName: currentRoom, userId: user.userId });
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRoom(null);
    setCurrentChat(null);
    setMessages([]);
    setUsers([]);
    setShowAccountSelection(true);
    setAccountType('guest');
    setIsMaster(false);
    setIsAdmin(false);
    setUsername('');
    setPassword('');
    socket.disconnect();
    socket.connect();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Container maxWidth="sm">
          {showAccountSelection ? (
            <Card
              elevation={24}
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    ChatBay
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Choose your account type to continue
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleAccountSelection('master')}
                    sx={{ 
                      py: 3,
                      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
                      '&:hover': { 
                        background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(255, 107, 107, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box sx={{ textAlign: 'left', width: '100%' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Master Account
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Full system control and group management
                      </Typography>
                    </Box>
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => handleAccountSelection('guest')}
                    sx={{ 
                      py: 3,
                      borderRadius: 3,
                      borderWidth: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box sx={{ textAlign: 'left', width: '100%' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Guest Account
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Regular chat access with group creation
                      </Typography>
                    </Box>
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : accountType === 'master' ? (
            <Card
              elevation={24}
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Master Account Login
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Enter master credentials to access full control
                </Typography>
                
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 3 }}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleMasterLogin()}
                  sx={{ mb: 3 }}
                  variant="outlined"
                />
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBackToSelection}
                    sx={{ flex: 1, borderRadius: 2 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleMasterLogin}
                    disabled={!username.trim() || !password.trim() || connectionStatus === 'connecting'}
                    sx={{ 
                      flex: 1,
                      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                      borderRadius: 2,
                      '&:hover': { 
                        background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)'
                      }
                    }}
                  >
                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Login'}
                  </Button>
                </Box>
                
                {connectionStatus === 'connecting' && (
                  <LinearProgress sx={{ borderRadius: 1 }} />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card
              elevation={24}
              sx={{
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ fontWeight: 700 }}
                >
                  Guest Account
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Enter your username to start chatting
                </Typography>
                
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  sx={{ mb: 3 }}
                  variant="outlined"
                />
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBackToSelection}
                    sx={{ flex: 1, borderRadius: 2 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleLogin}
                    disabled={!username.trim() || connectionStatus === 'connecting'}
                    sx={{ 
                      flex: 1,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': { 
                        background: 'linear-gradient(45deg, #764ba2, #667eea)'
                      }
                    }}
                  >
                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Join Chat'}
                  </Button>
                </Box>
                
                {connectionStatus === 'connecting' && (
                  <LinearProgress sx={{ borderRadius: 1 }} />
                )}
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc' }}>
      {/* Connection Status */}
      {connectionStatus !== 'connected' && (
        <Alert 
          severity={connectionStatus === 'disconnected' ? 'error' : 'warning'}
          sx={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            borderRadius: 0
          }}
        >
          {connectionStatus === 'disconnected' ? 'Disconnected from server' : 'Connecting to server...'}
        </Alert>
      )}
      
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none'
          },
        }}
      >
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #fff, #f0f0f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              ChatBay
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isMaster && (
                <Chip 
                  label="MASTER" 
                  size="small" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)'
                    }
                  }}
                />
              )}
              {isAdmin && !isMaster && (
                <Chip 
                  label="ADMIN" 
                  size="small" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #764ba2, #667eea)'
                    }
                  }}
                />
              )}
              <Typography variant="body2" sx={{ mr: 1, fontWeight: 500 }}>
                {user.username}
              </Typography>
              <IconButton 
                onClick={handleLogout} 
                size="small"
                sx={{ 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ overflow: 'auto', height: 'calc(100vh - 64px)' }}>
          {/* Rooms Section */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GroupIcon sx={{ color: 'white', mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Group Chats
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setShowCreateRoom(true)}
                sx={{ 
                  ml: 'auto',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
            <List dense>
              {rooms.map((room) => (
                <ListItem
                  key={room.name}
                  sx={{ 
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: currentRoom === room.name ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    '&:hover': {
                      bgcolor: currentRoom === room.name ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemButton
                    selected={currentRoom === room.name}
                    onClick={() => handleJoinRoom(room.name)}
                    sx={{ 
                      flexGrow: 1,
                      borderRadius: 2,
                      color: 'white'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                        <GroupIcon sx={{ color: 'white' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={room.name}
                      secondary={`${room.participants} participants`}
                      sx={{
                        '& .MuiListItemText-primary': { color: 'white', fontWeight: 500 },
                        '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                      }}
                    />
                  </ListItemButton>
                  {isMaster && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRoom(room.name)}
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { 
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          color: '#ff6b6b'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Users Section */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ color: 'white', mr: 1 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Online Users
              </Typography>
            </Box>
            <List dense>
              {users
                .filter(u => u.userId !== user.userId)
                .map((otherUser) => (
                  <ListItem
                    key={otherUser.userId}
                    sx={{ 
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: currentChat?.userId === otherUser.userId ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      '&:hover': {
                        bgcolor: currentChat?.userId === otherUser.userId ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemButton
                      selected={currentChat?.userId === otherUser.userId}
                      onClick={() => handlePrivateChat(otherUser)}
                      sx={{ 
                        borderRadius: 2,
                        color: 'white'
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          color="success"
                          variant="dot"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        >
                          <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                            <PersonIcon sx={{ color: 'white' }} />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={otherUser.username}
                        secondary="Online"
                        sx={{
                          '& .MuiListItemText-primary': { color: 'white', fontWeight: 500 },
                          '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          </Box>

          {/* AI Assistant Button */}
          <Box sx={{ p: 2, mt: 'auto' }}>
            <Tooltip title="Open AI Assistant" placement="top">
              <Fab
                color="primary"
                onClick={handleAIAssistant}
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{ fontSize: '20px' }}>🤖</span>
              </Fab>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>

      {/* Main Chat Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {currentRoom || currentChat ? (
          <>
            {/* Chat Header */}
            <AppBar 
              position="static" 
              elevation={0}
              sx={{ 
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <Toolbar>
                <Avatar sx={{ mr: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  {chatType === 'group' ? <GroupIcon sx={{ color: 'white' }} /> : <PersonIcon sx={{ color: 'white' }} />}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {chatType === 'group' 
                      ? currentRoom 
                      : users.find(u => u.userId === currentChat?.userId)?.username
                    }
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {chatType === 'group' ? 'Group Chat' : 'Private Chat'}
                  </Typography>
                </Box>
              </Toolbar>
            </AppBar>

            {/* Messages */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                p: 3, 
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                position: 'relative'
              }}
              className="messages-container"
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.senderId === user.userId ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      background: message.senderId === user.userId 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'rgba(255, 255, 255, 0.9)',
                      color: message.senderId === user.userId ? 'white' : 'text.primary',
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      '&::before': message.senderId === user.userId ? {
                        content: '""',
                        position: 'absolute',
                        right: -8,
                        top: 12,
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid #667eea',
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent'
                      } : {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        top: 12,
                        width: 0,
                        height: 0,
                        borderRight: '8px solid rgba(255, 255, 255, 0.9)',
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, opacity: 0.9 }}>
                      {message.sender}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                      {message.text}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {typingUsers.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 3,
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Message Input */}
            <Box sx={{ 
              p: 3, 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <IconButton
                  onClick={handleEmojiButtonClick}
                  sx={{
                    color: '#667eea',
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <EmojiIcon />
                </IconButton>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  onBlur={handleStopTyping}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  variant="outlined"
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      }
                    }
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  sx={{
                    bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    width: 48,
                    height: 48,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      transform: 'scale(1.05)'
                    },
                    '&:disabled': {
                      bgcolor: 'grey.300',
                      color: 'grey.500'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          /* Welcome Screen */
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              position: 'relative'
            }}
          >
            <Card 
              elevation={24}
              sx={{ 
                maxWidth: 500, 
                textAlign: 'center',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <ChatIcon style={{ 
                    fontSize: '80px', 
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '16px' 
                  }} />
                </Box>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Welcome to ChatBay 
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  Select a group chat or start a private conversation to begin messaging
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Create Room Dialog */}
      <Dialog 
        open={showCreateRoom} 
        onClose={() => setShowCreateRoom(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          color: 'white',
          fontWeight: 600
        }}>
          Create New Group Chat
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea'
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setShowCreateRoom(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRoom} 
            disabled={!newRoomName.trim()}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2, #667eea)'
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emoji Picker Popover */}
      <Popover
        open={showEmojiPicker}
        anchorEl={emojiAnchorEl}
        onClose={() => {
          setShowEmojiPicker(false);
          setEmojiAnchorEl(null);
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: 400,
            maxHeight: 300
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}>
            Choose Emoji
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(8, 1fr)', 
            gap: 1,
            maxHeight: 250,
            overflow: 'auto'
          }}>
            {emojis.map((emoji, index) => (
              <IconButton
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                sx={{
                  fontSize: '24px',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {emoji}
              </IconButton>
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default App;