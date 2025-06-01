import { config } from 'dotenv';
import express from 'express';
import connectToDB from './connect';
import cors from 'cors';
import mainRoutes from './routes/mainRoutes';
import cookieParser from 'cookie-parser';
import { swaggerSpec, swaggerUi } from './swagger';
import { createServer } from 'http';
import { verifyToken } from './middleware/auth';
import env from './Ienv';
import { initializeIO } from './services/io';
import { Server } from 'socket.io';

// Load environment variables
config();

// Create Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: false
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  pingTimeout: 5000,
  pingInterval: 3000,
  upgradeTimeout: 5000,
  allowUpgrades: true,
  cookie: false
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/', mainRoutes);

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }
    const decoded = await verifyToken(token);
    socket.data.userId = decoded.userId;
    console.log('Socket authenticated:', socket.id, 'userId:', decoded.userId);
    next();
  } catch (err) {
    console.error('Socket auth error:', err);
    next(new Error('Authentication failed'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, 'userId:', socket.data.userId);

  // Handle ping
  socket.on('ping', () => {
    console.log('Ping received from:', socket.id);
    socket.emit('pong');
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'reason:', reason);
  });

  // Handle new bid
  socket.on('newBid', (data) => {
    const { rideId, bid } = data;
    console.log("New bid event received:", data);
    if (rideId) {
      io.to(`ride:${rideId}`).emit('newBid', {
        rideId,
        bid,
        bidderId: socket.data.userId,
        timestamp: new Date().toISOString()
      });
      console.log(`New bid in ride ${rideId} from user ${socket.data.userId}: ${bid}`);
    }
  });

  // Handle bid accepted
  socket.on('bidAccepted', (data) => {
    const { rideId, bid, bidderId } = data;
    if (rideId) {
      io.to(`ride:${rideId}`).emit('bidAccepted', {
        rideId,
        bid,
        bidderId,
        acceptedBy: socket.data.userId,
        timestamp: new Date().toISOString()
      });
      console.log(`Bid accepted in ride ${rideId} for user ${bidderId}`);
    }
  });

  // Join ride room
  socket.on('join_ride', (data, callback) => {
    try {
      const { rideId, userId } = data;
      console.log(`User ${userId} joining ride room ${rideId}`);
      socket.join(`ride:${rideId}`);
      callback({ success: true });
    } catch (error) {
      console.error('Join ride error:', error);
      callback({ success: false, error: 'Failed to join ride room' });
    }
  });

  // Leave ride room
  socket.on('leave_ride', (data) => {
    const { rideId } = data;
    socket.leave(`ride:${rideId}`);
    console.log(`User ${socket.data.userId} left ride room ${rideId}`);
  });

  // Location update
  socket.on('location_update', (data) => {
    const { rideId, location } = data;
    if (rideId) {
      io.to(`ride:${rideId}`).emit('riderLocationUpdate', {
        userId: socket.data.userId,
        location,
        rideId,
        timestamp: Date.now()
      });
      console.log(`Location update in ride ${rideId} from user ${socket.data.userId}`);
    }
  });

  // Handle ride status updates
  socket.on('ride_status_update', (data) => {
    const { rideId, status } = data;
    if (rideId) {
      io.to(`ride:${rideId}`).emit('rideStatusUpdate', {
        rideId,
        status,
        timestamp: new Date().toISOString()
      });
      console.log(`Ride status update in ride ${rideId}: ${status}`);
    }
  });
});

app.get('/socket-test', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Socket.IO Test</h1>
        <script src="/socket.io/socket.io.js"></script>
        <script>
          const socket = io({
            transports: ['websocket', 'polling']
          });
          
          socket.on('connect', () => {
            document.body.innerHTML += '<p>Connected to server!</p>';
          });
          
          socket.on('connect_error', (error) => {
            document.body.innerHTML += '<p>Error: ' + error + '</p>';
          });
        </script>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Define the port and host
const port = process.env.PORT || 8002;
const host = '0.0.0.0'; // Listen on all network interfaces

// Log MongoDB URL before connection attempt
const mongoDBUrl = env.MONGODB_URL;
console.log('Attempting to connect to MongoDB at:', mongoDBUrl);

// Connect to the database and start server
connectToDB()
  .then((connectMessage) => {
    console.log(connectMessage);

    // Start the server
    httpServer.listen({ port, host }, () => {
      console.log(`Server started on http://${host}:${port}`);
      console.log(`Socket.IO server running on path: /socket.io/`);
      console.log(`For local access use: http://localhost:${port}`);
      console.log(`For network access use: http://192.168.1.65:${port}`);
      console.log(`For Android Emulator use: http://10.0.2.2:${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

export default app;
