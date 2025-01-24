const mongoose = require('mongoose');

  // Fungsi untuk menghubungkan ke MongoDB
  const connectDB = async () => {
    try {
      // Gantilah URI berikut dengan URI database MongoDB kamu
      const conn = await mongoose.connect('mongodb+srv://rezapratama1912:cljOpvSDMNXsNllO@cluster0.haaew.mongodb.net/Proyek_FPW', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.error('Error connecting to MongoDB:', err.message);
      process.exit(1); // Keluar jika terjadi error pada koneksi DB
    }
  };
  
  module.exports = connectDB;