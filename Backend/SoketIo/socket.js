let io;

const setIO = (socketInstance) => {
  io = socketInstance;
};

const getIO = () => {
  return io;
};

module.exports = {
  setIO,
  getIO,
};