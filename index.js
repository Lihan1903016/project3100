// Import required modules
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
// Creating an express app
const app = express();

const path = require('path');

app.use(express.static(path.join(__dirname, '../Project')));
app.use(express.static(path.join(__dirname, './HTML FILES')))
app.use(express.static(path.join(__dirname, './Image')));


// bodyParser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

app.get('/Studentpanel', (req, res) => {
    // Render Studentpanel HTML page
    res.sendFile(__dirname + '/HTML FILES/Studentpanel.html');
});
app.get('/Teacherspanel', (req, res) => {
    // Render Teacherspanel HTML page
    res.sendFile(__dirname + '/HTML FILES/Teacherspanel.html');
});

app.get('/CTresultbySearch', (req, res) => {
    //CT result by search HTML page
    res.sendFile(__dirname + '/HTML FILES/CTresultbySearch.html');
});

app.get('/AllResults', (req, res) => {
    //All Results
    res.sendFile(__dirname + '/HTML FILES/AllResults.html');
});

app.get('/ContactInfo', (req, res) => {
    //Contact Info
    res.sendFile(__dirname + '/HTML FILES/ContactInfo.html');
});

app.get('/mailbox', (req, res) => {
    //mailbox
    res.sendFile(__dirname + '/HTML FILES/mailbox.html');
});


// MySQL connection Code
const connection = mysql.createConnection({
    host: 'localhost', // Replace with MySQL host
    user: 'root', // Replace with MySQL username
    password: '', // Replace with MySQL password
    database: 'projectdatabase' // Replace with MySQL database name
});


// Connection to MySQL
connection.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err); //if it doesn't connect to database
        return;
    }
    console.log('Connected to database');
});




// Registration of Students Data from HTML form
app.post('/studentform', (req, res) => {
    const { name, email, password, department, series, roll } = req.body; // Extract form data from request body
    // Insert form data into MySQL
    const query = `INSERT INTO Students_Of_RUET (name, email,password,department,series,roll) VALUES (?, ?, ?, ?,?,?)`;
    connection.query(query, [name, email, password, department, series, roll], (err, result) => {
        if (err) {
            console.error('Error occured while inserting data:', err);
            return;
        }
        console.log('Student Data inserted into database:', result);

        // Send response to client
        res.redirect(req.get('referer') + '?response=Submitted.');
    });
});


//Registration of Teachers Data from HTML form
app.post('/teacherform', (req, res) => {
    const { name, email, password, department } = req.body; // Extract form data from request body
    // Insert form data into MySQL
    const query = `INSERT INTO Teachers_Of_RUET (name, email,password,department) VALUES (?, ?, ?, ?)`;
    connection.query(query, [name, email, password, department], (err, result) => {
        if (err) {
            console.error('Error occured while inserting data:', err);
            return;
        }
        console.log('Teachers Data inserted into database:', result);

        // Send response to client
        res.redirect(req.get('referer') + '?response=Submitted.');
    });
});



//Login for Student
app.post('/studentlogin', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM Students_Of_RUET WHERE email = ? AND password = ?`;

    connection.query(query, [email, password], (err, result) => {
        if (err) {
            console.error('Error occured while fetching data:', err);
            return;
        }
        if (result.length > 0) {
            res.redirect('/Studentpanel');
            console.log('Student Login Successful.', result);
        } else {
            res.redirect(req.get('referer') + '?response=Invalid email or password');
            console.log('Student Login failed.', result);
        }
    });
});

//Login For Teachers
app.post('/teacherlogin', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM Teachers_Of_RUET WHERE email = ? AND password = ?`;

    connection.query(query, [email, password], (err, result) => {
        if (err) {
            console.error('Error occured while fetching data:', err);
            return;
        }
        if (result.length > 0) {
            res.redirect('/Teacherspanel');
            console.log('Teacher Login Successful.', result);
        } else {
            res.redirect(req.get('referer') + '?response=Invalid email or password');
            console.log('Teacher Login failed.', result);
        }
    });
});


// Inserting CT Marks from HTML form
app.post('/ctmarks', (req, res) => {
    const { department, series, course, ctno, roll, marks } = req.body; // Extract form data from request body
    // Insert form data into MySQL
    const query = `INSERT INTO ct_marks(department,series,course,ctno,roll,marks) VALUES (?, ?, ?,?,?,?)`;
    connection.query(query, [department, series, course, ctno, roll, marks], (err, results) => {
        if (err) {
            console.error('Error occured while inserting data:', err);
            return;
        }
        console.log('Student CT Marks inserted into database:', results);

        // Send response to client
        res.redirect(req.get('referer') + '?response=Mark Submitted.');
    });
});

// Get All Results
app.get('/ct_data', (req, res) => {
    const CTmarks = 'SELECT * FROM ct_marks';
    connection.query(CTmarks, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

//Get Result by Searching Roll
app.get('/search', (req, res) => {
    const { roll, course, ctno } = req.query;
    const query = `SELECT course,ctno,roll, marks FROM ct_marks WHERE roll = ? AND course=? AND ctno=?`;

    connection.query(query, [roll, course, ctno], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error searching for marks.' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Nothing Found for \nRoll:' + roll + '\nCourse Title:' + course + '\nCt no.:' + ctno + '\n\nCheck All Fields and Retry Again' });
        } else {
            const course = results[0].course;
            const ctno = results[0].ctno;
            const roll = results[0].roll;
            const marks = results[0].marks;
            res.json({ course, ctno, roll, marks });
            console.log("Search Result:", results);
        }
    });
});



//Contact Us
app.post('/send-email', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Create a transporter object
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'lihanahmed655@gmail.com',
            pass: 'oiovtmihfulfubnc'
        }
    });

    // Setup email data with unicode symbols
    const mailOptions = {
        from: email,
        to: 'lihanahmed655@gmail.com',
        subject: subject,
        html: `<h1>User's Name: ${name}</h1><p>User's Email: ${email}</p><p>User's Message: ${message}</p>`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect(req.get('referer') + '?confirmation=Mail sent successfully.');
        }
    });
});



//Admin Login Panel
app.post('/adminlogin', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM admin WHERE email = ? AND password = ?`;

    connection.query(query, [email, password], (err, result) => {
        if (err) {
            console.error('Error occured while fetching data:', err);
            return;
        }
        if (result.length > 0) {
            res.redirect('/mailbox');
            console.log('Admin Login Successful.', result);
        } else {
            res.redirect(req.get('referer') + '?invalid=Invalid email or password');
            console.log('Admin Login Attempt Failed.', result);
        }
    });
});



//Admin Mailing Section 
app.post('/communication', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Create a transporter object
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'lihanahmed655@gmail.com',
            pass: 'oiovtmihfulfubnc'
        }
    });

    // Setup email data 
    const mailOptions = {
        from: 'lihanahmed655@gmail.com',
        to: email,
        subject: subject,
        html: `<h1>Sender Name: ${name}</h1><p>Sender Message: ${message}</p>`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.redirect(req.get('referer') + '?confirmation=Failed to send mail.');
            res.send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect(req.get('referer') + '?confirmation=Mail sent successfully.');
        }
    });
});

// Start the server
app.listen(16, () => {
    console.log('Server running on http://localhost:16');
});