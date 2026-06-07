require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db.config');

const PORT = process.env.PORT || 3000;



// DB connect hone ke baad hi server start karo
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}).catch((err) => {
  console.error('❌ DB connect nahi hua, server band:', err.message);
  process.exit(1);
});
