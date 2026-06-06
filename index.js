const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// 클라이언트 폴더의 파일들을 서버에서 바로 볼 수 있게 설정
app.use(express.static(path.join(__dirname, '../client')));

// 기본 주소(/)로 접속하면 index.html을 보여줌
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

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

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
