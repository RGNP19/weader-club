const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

// 데이터 저장 경로 설정
const DATA_PATH = path.join(__dirname, 'data', 'messages.json');
const DATA_DIR = path.join(__dirname, 'data');

// 데이터 폴더가 없으면 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 최근 메시지를 불러오거나 초기화
let messageHistory = [];
try {
  if (fs.existsSync(DATA_PATH)) {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    messageHistory = JSON.parse(data);
  }
} catch (err) {
  console.error('Error loading messages:', err);
  messageHistory = [];
}

const MAX_HISTORY = 100; // 최대 100개까지 저장

// 메시지 저장 함수
const saveMessages = () => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(messageHistory, null, 2));
  } catch (err) {
    console.error('Error saving messages:', err);
  }
};

app.get('/', (req, res) => {
  // index.html 위치 확인 (server 폴더 또는 상위 폴더)
  const htmlPath = fs.existsSync(path.join(__dirname, 'index.html')) 
    ? path.join(__dirname, 'index.html')
    : path.join(__dirname, '..', 'client', 'index.html');
  res.sendFile(htmlPath);
});

app.use(express.static(path.join(__dirname)));

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
    saveMessages(); // 파일에 저장
    io.emit('receive-message', welcomeMsg);
  });

  socket.on('send-message', (data) => {
    messageHistory.push(data);
    if (messageHistory.length > MAX_HISTORY) messageHistory.shift(); 
    saveMessages(); // 파일에 저장
    io.emit('receive-message', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


