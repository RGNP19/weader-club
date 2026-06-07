const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// 현재 작업 디렉토리에서 index.html을 찾도록 설정
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// 정적 파일들도 현재 작업 디렉토리에서 찾음
app.use(express.static(process.cwd()));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  socket.on('join', (userName) => {
    io.emit('receive-message', {
      user: 'System',
      text: `${userName} 님이 입장하셨습니다.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on('send-message', (data) => {
    io.emit('receive-message', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
