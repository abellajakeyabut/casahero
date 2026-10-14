// Import Express
const express = require('express');
const path = require('path');
// Create an app instance
const app = express();

// Define a port
const PORT = 3000;

app.post('/casahero-api/signup', (req, res) => {
  // Handle signup logic here
  res.send({ outcome: 'Signup successful!', success: true });
});
app.post('/casahero-api/login', (req, res) => {
  // Handle signup logic here
  res.send({ outcome: 'login successful!', success: true });
});
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
