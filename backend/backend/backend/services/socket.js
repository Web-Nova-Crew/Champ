const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // Handle new message
    socket.on('send_message', (data) => {
      const { chatId, message } = data;
      
      // Broadcast message to all users in the chat room
      socket.to(`chat_${chatId}`).emit('new_message', {
        id: message.id,
        chatId: chatId,
        senderId: message.sender_id,
        senderName: message.sender_name,
        content: message.content,
        timestamp: message.created_at,
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { chatId, userName } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        userName: userName,
        isTyping: true,
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false,
      });
    });

    // Handle booking notifications
    socket.on('booking_update', (data) => {
      const { propertyOwnerId, booking } = data;
      socket.to(`user_${propertyOwnerId}`).emit('booking_notification', {
        type: 'booking_update',
        booking: booking,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle property notifications
    socket.on('property_inquiry', (data) => {
      const { propertyOwnerId, inquiry } = data;
      socket.to(`user_${propertyOwnerId}`).emit('property_notification', {
        type: 'property_inquiry',
        inquiry: inquiry,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper functions to emit events from other parts of the application
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToChat = (chatId, event, data) => {
  if (io) {
    io.to(`chat_${chatId}`).emit(event, data);
  }
};

const emitNewMessage = (chatId, message) => {
  if (io) {
    io.to(`chat_${chatId}`).emit('new_message', {
      id: message.id,
      chatId: chatId,
      senderId: message.sender_id,
      senderName: message.sender_name,
      content: message.content,
      timestamp: message.created_at,
    });
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToChat,
  emitNewMessage,
};
