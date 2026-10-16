require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API Recetario funcionando' }));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/recipes', require('./src/routes/recipeRoutes'));
app.use('/api/groups', require('./src/routes/groupRoutes'));

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
});
