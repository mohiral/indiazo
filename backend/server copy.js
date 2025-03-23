const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

// Import routes
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes")

const app = express();
const server = http.createServer(app); // HTTP server for WebSocket
const wss = new WebSocket.Server({ server }); // WebSocket server

app.use(cors());
app.use(express.json());

// Create 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB connection
mongoose
  .connect("mongodb+srv://harishkumawatkumawat669:7FiBpE7v7lNyDp6G@cluster0.ogeix.mongodb.net/Avitor", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// WebSocket connection
wss.on("connection", (ws) => {
  console.log("New client connected");

  let balance = 100;

  // Send real-time balance updates every 3 seconds
  const interval = setInterval(() => {
    balance += Math.floor(Math.random() * 50); // Random increment
    ws.send(JSON.stringify({ confirmedBalance: balance }));
  }, 3000);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval); // Clear interval when client disconnects
  });
});

// Use routes
app.use("/api", paymentRoutes);
app.use("/api", userRoutes);
app.use("/api", withdrawalRoutes)
// Start server
const PORT = 5001;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
