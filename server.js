const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const topicRoutes = require('./routes/topicRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const commentRoutes = require('./routes/commentRoutes');
const voteRoutes = require('./routes/voteRoutes');
const userTopicFollowRoutes = require('./routes/userTopicFollowRoutes');
const { setSocketIO } = require('./controllers/commentController');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  },
  pingTimeout: 60000
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set socket instance to controllers
setSocketIO(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes(io));
app.use('/api/user-topic-follows', userTopicFollowRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining topic room
  socket.on('joinTopic', (topicId, callback) => {
    console.log(`Received joinTopic event with topicId: ${topicId}`);
    socket.join(`topic_${topicId}`);
    console.log(`User ${socket.id} joined topic room: topic_${topicId}`);
    if (callback) callback();
  });

  // Handle leaving topic room
  socket.on('leaveTopic', (topicId) => {
    console.log(`User ${socket.id} left topic room: topic_${topicId}`);
    socket.leave(`topic_${topicId}`);
  });

  // Handle new comment
  socket.on('newComment', (data) => {
    console.log(`Broadcasting new comment to room topic_${data.topicId}`);
    socket.to(`topic_${data.topicId}`).emit('commentAdded', data);
  });

  // Handle comment update
  socket.on('updateComment', (data) => {
    console.log(`Broadcasting updated comment to room topic_${data.topicId}`);
    socket.to(`topic_${data.topicId}`).emit('commentUpdated', data);
  });

  // Handle comment delete
  socket.on('deleteComment', (data) => {
    console.log(`Broadcasting deleted comment to room topic_${data.topicId}`);
    socket.to(`topic_${data.topicId}`).emit('commentDeleted', data);
  });

  // Handle vote update
  socket.on('voteUpdate', (data) => {
    console.log(`Broadcasting vote update to room topic_${data.topicId}`);
    socket.to(`topic_${data.topicId}`).emit('voteUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
