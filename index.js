const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const session = require('express-session');

// Initialize sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
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
app.post('/Teacherspanel2', (req, res) => {
    res.sendFile(__dirname + '/HTML FILES/Teacherspanel2.html');
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

app.get('/admin', (req, res) => {
    //mailbox
    res.sendFile(__dirname + '/HTML FILES/admin.html');
});

app.get('/studentinfo',(req,res)=>{
    res.sendFile(__dirname + '/HTML FILES/studentinfo.html');
});

app.get('/teacherinfo' , (req , res)=>{
   res.sendFile(__dirname + '/HTML FILES/teacherinfo.html');
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
    
    // Check if the email already exists in the database
    const checkQuery = `SELECT email,password,roll FROM Students_Of_RUET WHERE email = ? OR password=? or roll=?`;

    connection.query(checkQuery, [email,password,roll], (err, result) => {
        if (err) {
            console.error('Error occurred while checking email:', err);
            return;
        }

        if (result.length > 0) {
           res.redirect(req.get('referer') + '?checkStdEmail=Similar EMAIL,PASSWORD or ROLL has been found.Try again with new EMAIL,PASSWORD or ROLL');
        } else {
            const insertQuery = `INSERT INTO Students_Of_RUET (name, email, password, department, series, roll) VALUES (?, ?, ?, ?, ?, ?)`;
            connection.query(insertQuery, [name, email, password, department, series, roll], (err, result) => {
                if (err) {
                    console.error('Error occurred while inserting data:', err);
                    return;
                }
                console.log('Student Data inserted into the database:', result);
                // Send response to client
                res.redirect(req.get('referer') + '?response=Submitted.');
            });
        }
    });
});



app.post('/teacherform', (req, res) => {
    const { name, email, password, department} = req.body;
    const checkEmailQuery = `SELECT email,password FROM teachers_of_ruet WHERE email = ? OR password=?`;

    connection.query(checkEmailQuery, [email,password], (err, result) => {
        if (err) {
            console.error('Error occurred while checking email:', err);
            return;
        }

        if (result.length > 0) {
            res.redirect(req.get('referer')+ '?checkTeacherEmail=The email or password you entered is already in our database. Please try a new one.');
        } else {
            const insertQuery = `INSERT INTO teachers_of_ruet(name, email, password, department) VALUES (?, ?, ?, ?)`;
            connection.query(insertQuery, [name, email, password, department], (err, result) => {
                if (err) {
                    console.error('Error occurred while inserting data:', err);
                    return;
                }
                console.log('Teachers Data inserted into the database:', result);
                // Send response to client
                res.redirect(req.get('referer') + '?response=Submitted.');
            });
        }
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


app.get('/ctmarks', (req, res) => {
    const {department,series,course,ctno } = req.query;
    res.redirect(`/Teacherspanel2.html?department=${department}&series=${series}&course=${course}&ctno=${ctno}`);
  });

  app.get('/ctmarks2', (req, res) => {
    const { department, series, course, ctno, rollno, marks } = req.query;
    const query = `SELECT * FROM ct_marks WHERE department='${department}' AND series=${series} AND course='${course}' AND ctno='${ctno}';`;

    let deptcode = '';
    if (department === "CSE") {
        deptcode = '03';
    }
    else if(department=='CE'){
        deptcode='00';
    }
    else if(department=='MSE'){
        deptcode='13';
    }
    else if(department=='ME'){
        deptcode='02';
    }
    else if(department=='EEE'){
        deptcode='01';
    }
    else if(department=='GCE'){
        deptcode='06';
    }
    else if(department=='Arch'){
        deptcode='09';
    }
    else if(department=='ETE'){
        deptcode='04';
    }
    else if(department=='MTE'){
        deptcode='08';
    }
    else if(department=='IPE'){
        deptcode='05';
    }
    else if(department=='ECE'){
        deptcode='10';
    }
    else if(department=='CFPE'){
        deptcode='11';
    }
    else if(department=='BECM'){
        deptcode='12';
    }
    else{
        deptcode='07';
    }

    // Construct the roll value using template literals
    const roll = `${series}${deptcode}${rollno}`;
    connection.query(query, (err, result) => {
      if (err) throw err;
      else {
        // Data doesn't exist, insert a new row
        const query2 = `INSERT IGNORE INTO ct_marks (department, series, course, ctno, roll, marks) VALUES ('${department}', '${series}', '${course}', '${ctno}', '${roll}', '${marks}'); `;
        connection.query(query2, (err) => {
          if (err) throw err;
          console.log('Student CT Marks inserted into database:', result);
        });
        res.redirect(req.get('referer'));
      }
    });
  });
  


// Get All Results
app.get('/ct_data', (req, res) => {
    const CTmarks = 'SELECT department,series,course,ctno,roll,marks FROM ct_marks ORDER BY Roll ASC;';
    connection.query(CTmarks, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

app.get('/searchbydept', (req, res) => {
    const { department, series } = req.query;
    const Query = `SELECT * FROM ct_marks WHERE department=? AND series=?`;
    connection.query(Query, [department, series], (err, result) => {
        if (err) {
            console.error(err);
        } else {
            res.json(result);
            console.log(result);
        }
    });
});

app.get('/delete', (req, res) => {
  const {department,series}=req.query; 
  const query=`DELETE FROM ct_marks WHERE department=? AND series=?`;
  connection.query(query,[department,series],(err,results)=>{
    if(err) throw err;
    console.log('Deleted All Data',results);
    res.redirect(req.get('referer'));
  })  
});
// Get Result by Searching Roll
app.get('/search', (req, res) => {
    const { roll, course, ctno } = req.query;
    const query = `SELECT course, ctno, roll, marks FROM ct_marks WHERE roll = ? AND course = ? AND ctno = ?`;

    connection.query(query, [roll, course, ctno], (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error searching for marks.' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Nothing Found for \nRoll: ' + roll + '\nCourse Title: ' + course + '\nCT No.: ' + ctno + '\n\nCheck All Fields and Retry Again' });
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
        html: `<h1>Sender: ${name}</h1><h4>Sender Email: ${email}</h4><h4>${message.replace(/\n/g, '<br>')}</h4>`
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
            res.redirect('/admin');
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
        html: `<h1>Hello,This is Lihan Ahmed</h1>
        <h2>Message:</h2>
        <p> ${message.replace(/\n/g,'<br>')}</p>`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.redirect(req.get('referer') + '?confirm=Failed to send mail.');
            res.send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect(req.get('referer') + '?confirm=Mail sent successfully.');
        }
    });
});



app.post('/updateRow', (req, res) => {
    const { course, ctno, roll, department, series, marks } = req.body;
  
    // Update the row in the database
    const sql = 'UPDATE ct_marks SET marks = ? WHERE department = ? AND series = ? AND course = ? AND ctno = ? AND roll = ?';
    const values = [marks, department, series, course, ctno, roll];
  
    connection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Database update error: ' + err.message);
        res.status(500).json({ message: 'Failed to update row' });
      } else {
        console.log('Row updated successfully',course, ctno, roll, department, series, marks);
        res.status(200).json({ message: 'Row updated successfully' });
      }
    });
  });
  

app.get('/studentsInfo', (req, res) => {
    const studentinfo = 'SELECT * FROM students_of_ruet group by roll;';
    connection.query(studentinfo, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

app.get('/teachersInfo', (req, res) => {
    const CTmarks = 'SELECT Distinct * FROM teachers_of_ruet ORDER BY department ASC ';
    connection.query(CTmarks, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});


app.get('/logout', (req, res) => {
    // Destroy the user's session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      // Redirect the user to the login page or any other page
      res.redirect('/login');
    });
  });
  

// Start the server
app.listen(16, () => {
    console.log('Server running on http://localhost:16');
});