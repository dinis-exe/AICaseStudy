const express = require('express');
const path = require('path');
const multer = require('multer');
const { auth } = require('express-openid-connect');
const app = express();
const PORT = process.env.PORT || 3000;

// Auth0 configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'nxkhkDsXKc4jC1nblZyxGPAU8hVznu6u',
  issuerBaseURL: 'https://dev-jk7qsbb65cwkywqu.eu.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle image upload and analysis
app.post('/api/analyze', upload.single('image'), (req, res) => {
    // Simulate an API call to get the diagnosis and probability
    const diagnosis = 'Sample Diagnosis';
    const probability = '95%';

    res.json({ diagnosis, probability });
});

// Serve the index.html file with authentication status
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to check authentication status
app.get('/auth-status', (req, res) => {
    res.json({ isAuthenticated: req.oidc.isAuthenticated() });
});

// Serve the profile.html file
app.get('/profile', (req, res) => {
    if (req.oidc.isAuthenticated()) {
        res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    } else {
        res.redirect('/login');
    }
});

// Route to get user information
app.get('/user-info', (req, res) => {
    if (req.oidc.isAuthenticated()) {
        res.json(req.oidc.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Add routes for About and Contact pages
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
