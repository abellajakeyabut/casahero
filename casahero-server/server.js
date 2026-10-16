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
app.post('/casahero-api/logout', (req, res) => {
  // Handle signup logic here
  res.send({ outcome: 'logout successful!', success: true });
});


app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
  });
  next();
});

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
