# ChatBay Frontend

Modern real-time chat application frontend built with React, Vite, and Material-UI.

## Features

- Real-time messaging with Socket.IO
- Group chat functionality
- Private messaging
- Master account system
- Emoji picker
- Typing indicators
- Connection status monitoring
- AI Assistant integration
- Modern UI with Material-UI

## Tech Stack

- **React** - Frontend framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - UI component library
- **Socket.IO Client** - Real-time communication
- **CSS3** - Styling and animations

## Installation

1. Clone the repository
```bash
git clone <your-frontend-repo-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp env.example .env
# Edit .env with your backend URL
```

4. Start the development server
```bash
npm run dev
```

## Environment Variables

- `VITE_SERVER_URL` - Backend server URL
- `VITE_SOCKET_URL` - Socket.IO server URL
- `VITE_AI_ASSISTANT_URL` - AI Assistant URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

### Account System
- **Guest Account**: Regular chat access
- **Master Account**: Full system control
- **Account Selection**: Choose account type on login

### Chat Features
- **Group Chats**: Create and join group conversations
- **Private Messages**: One-to-one conversations
- **Emoji Support**: Built-in emoji picker
- **Typing Indicators**: Real-time typing feedback
- **Message History**: View previous messages

### UI Features
- **Modern Design**: Glass morphism and gradients
- **Responsive Layout**: Works on all devices
- **Dark/Light Themes**: Material-UI theming
- **Animations**: Smooth transitions and effects

### Admin Features
- **Master Control**: Delete any group (master only)
- **User Management**: View online users
- **Room Management**: Create and manage groups

## Deployment

This frontend is configured for deployment on Render, Vercel, or Netlify:

### Render (Static Site)
1. Connect your repository to Render
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variables

### Vercel
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically

### Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variables

## Build

```bash
npm run build
```

The build output will be in the `dist` directory.

## License

MIT
