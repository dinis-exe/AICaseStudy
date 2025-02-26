const express = require('express');
const path = require('path');
const multer = require('multer');
const { auth } = require('express-openid-connect');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database('./hospital_db.sqlite', (err) => {
    if (err) console.error('Database connection error:', err.message);
});

// Middleware for parsing URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Auth0 configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'https://aicasestudy.onrender.com/',
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

// Session middleware
app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: true,
}));

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

// New route: Serve hospital login page
app.get('/hospital-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hospital-login.html'));
});

// New route: Handle hospital login form submission - updated to check database credentials and save session
app.post('/hospital-verify', (req, res) => {
    let { worker, senha } = req.body;
    console.log("Before conversion:", { worker, senha, typeofWorker: typeof(worker) });
    worker = parseInt(worker, 10); // Convert worker ID to integer
    console.log("After conversion:", { worker, senha, typeofWorker: typeof(worker) });
    console.log("Executing query for worker ID:", worker, "and senha:", senha);
    db.get("SELECT * FROM Hospital_Worker WHERE worker_id = ? AND password = ?", [worker, senha], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.redirect('/hospital-login');
        }
        console.log("Query result:", row);
        if (row) {
            console.log("Login successful for worker:", row);
            // Save worker info in session
            req.session.worker = { worker, hospital_id: row.hospital_id };
            res.redirect('/hospital-dashboard');
        } else {
            console.log("Invalid credentials: no matching record found.");
            res.redirect('/hospital-login');
        }
    });
});

// New route: List patients for the hospital where the worker works
app.get('/hospital-patients', (req, res) => {
    if (!req.session.worker) {
        return res.status(401).json({ error: 'Not authenticated as hospital worker' });
    }
    const hospitalId = req.session.worker.hospital_id;
    // Query patients registered at this hospital
    const query = `
        SELECT p.patient_id, p.patient_name, p.gender, p.dob 
        FROM Patients p 
        WHERE p.hospital_id = ?
    `;
    db.all(query, [hospitalId], (err, rows) => {
        if (err) {
            console.error('Database error while retrieving patients:', err.message);
            return res.status(500).json({ error: 'Database error while retrieving patients' });
        }
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'No patients found for this hospital' });
        }
        res.json({ patients: rows });
    });
});

// Middleware to ensure hospital worker is authenticated
function ensureHospitalWorker(req, res, next) {
    if (req.session.worker) return next();
    res.redirect('/hospital-login');
}

// Serve hospital dashboard page
app.get('/hospital-dashboard', ensureHospitalWorker, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hospital-dashboard.html'));
});

// Endpoint: Add a new patient
app.post('/add-patient', ensureHospitalWorker, (req, res) => {
    const { patient_id, password, patient_name, dob, gender } = req.body;
    db.run(
        "INSERT INTO Patients (patient_id, password, patient_name, dob, gender) VALUES (?, ?, ?, ?, ?)",
        [patient_id, password, patient_name, dob, gender],
        function(err) {
            res.redirect('/manage-patients');
        }
    );
});

// Endpoint: Update a patient
app.post('/update-patient', ensureHospitalWorker, (req, res) => {
    const { patient_id, password, patient_name, dob, gender } = req.body;
    db.run(
        "UPDATE Patients SET password = ?, patient_name = ?, dob = ?, gender = ? WHERE patient_id = ?",
        [password, patient_name, dob, gender, patient_id],
        function(err) {
            res.redirect('/manage-patients');
        }
    );
});

// Endpoint: Delete a patient
app.post('/delete-patient', ensureHospitalWorker, (req, res) => {
    const { patient_id } = req.body;
    db.run(
        "DELETE FROM Patients WHERE patient_id = ?",
        [patient_id],
        function(err) {
            res.redirect('/manage-patients');
        }
    );
});

// Endpoint: Record a new exam (Patient_history)
// Expecting: patient_id, result, date (YYYY-MM-DD)
app.post('/record-exam', ensureHospitalWorker, (req, res) => {
    const { patient_id, result, date } = req.body;
    // Use hospital_id from worker's session
    const hospital_id = req.session.worker.hospital_id;
    db.run(
        "INSERT INTO Patient_history (patient_id, result, date, hospital_id) VALUES (?, ?, ?, ?)",
        [patient_id, result, date, hospital_id],
        function(err) {
            res.redirect('/hospital-dashboard');
        }
    );
});

// Endpoint: Get patient history for a given patient
app.get('/patient-history', ensureHospitalWorker, (req, res) => {
    const { patient_id } = req.query;
    db.all(
        "SELECT ph.history_id, ph.result, ph.date, h.hospital_name FROM Patient_history ph JOIN Hospitals h ON ph.hospital_id = h.hospital_id WHERE ph.patient_id = ?",
        [patient_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ history: rows });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
