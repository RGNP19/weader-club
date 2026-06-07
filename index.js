const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// 최근 메시지를 저장할 배열
let messageHistory = [];
const MAX_HISTORY = 50; // 최대 50개까지 저장

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.use(express.static(process.cwd()));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  // 새 사용자가 접속하면 저장된 메시지 내역을 먼저 보내줌
  socket.emit('chat-history', messageHistory);

  socket.on('join', (userName) => {
    const welcomeMsg = {
      user: 'System',
      text: `${userName} 님이 입장하셨습니다.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messageHistory.push(welcomeMsg);
    if (messageHistory.length > MAX_HISTORY) messageHistory.shift();
    io.emit('receive-message', welcomeMsg);
  });

  socket.on('send-message', (data) => {
    // 메시지를 역사에 기록
    messageHistory.push(data);
    if (messageHistory.length > MAX_HISTORY) messageHistory.shift(); 
    
    io.emit('receive-message', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


