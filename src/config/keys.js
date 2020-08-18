require('dotenv').config();

export const keys = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/gotools-meetings',
  secretOrKey: process.env.SECRET || 'secret',
  port: process.env.PORT,
};
