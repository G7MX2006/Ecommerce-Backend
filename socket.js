let io = null;

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
    });

    io.on("connection", (socket) => {
      console.log("⚡ Socket client connected:", socket.id);

      socket.on("joinOrder", (orderId) => {
        if (orderId) {
          socket.join(`order_${orderId}`);
          console.log(`Socket ${socket.id} joined room: order_${orderId}`);
        }
      });

      socket.on("joinProduct", (productId) => {
        if (productId) {
          socket.join(`product_${productId}`);
          console.log(`Socket ${socket.id} joined room: product_${productId}`);
        }
      });

      socket.on("disconnect", () => {
        console.log("⚡ Socket client disconnected:", socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    return io;
  },
  emitEvent: (event, data) => {
    if (io) {
      io.emit(event, data);
    }
  },
};
