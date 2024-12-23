// Set the API URL here
const apiUrl = 'https://cyq5iydpvl.execute-api.us-east-1.amazonaws.com/dev'; // Modify this URL

// Function to handle user registration
document.getElementById('registrationForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const password = document.getElementById('password').value;

    // Store user information in local storage
    const user = {
        fullName,
        email,
        phoneNumber,
        password,
        role: document.getElementById('isLecturer').checked ? 'lecturer' : 'student'
    };
    localStorage.setItem(email, JSON.stringify(user));

    alert('Registration successful! You can now log in.');
    window.location.href = 'login.html'; // Redirect to login
});

// Function to handle user login
document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Retrieve user data from local storage
    const userData = localStorage.getItem(email);
    if (userData) {
        const user = JSON.parse(userData);
        if (user.password === password) {
            // Store user session in local storage
            localStorage.setItem('loggedInUser', email);
            alert('Login successful!');
            // Redirect based on role
            if (user.role === 'student') {
                window.location.href = 'payment.html'; // Redirect to payment
            } else {
                window.location.href = 'dashboard.html'; // Redirect to dashboard
            }
        } else {
            alert('Incorrect password. Please try again.');
        }
    } else {
        alert('No user found with that email. Please sign up.');
    }
});

// Check if user is logged in for payment page
if (window.location.pathname.includes('payment.html')) {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        alert('You must be logged in to access this page.');
        window.location.href = 'login.html'; // Redirect to login
    }
}

// Check if user is logged in for lecturer dashboard
if (window.location.pathname.includes('dashboard.html')) {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        alert('You must be logged in to access this page.');
        window.location.href = 'login.html'; // Redirect to login
    } else {
        const user = JSON.parse(localStorage.getItem(loggedInUser));
        if (user.role !== 'lecturer') {
            alert('You do not have permission to access this page.');
            window.location.href = 'index.html'; // Redirect to home
        }
    }
}

// Function to save AWS Credentials
document.getElementById('awsCredentialsForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const accessKey = document.getElementById('awsAccessKey').value;
    const secretKey = document.getElementById('awsSecretKey').value;

    // Store credentials securely (ideally on the server side)
    localStorage.setItem('awsAccessKey', accessKey);
    localStorage.setItem('awsSecretKey', secretKey);

    alert('AWS Credentials saved successfully.');
});

// Function to handle IAM account creation
document.getElementById('createIAMForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const studentEmail = document.getElementById('studentEmail').value;
    const studentName = document.getElementById('studentName').value;

    // Retrieve AWS credentials from local storage
    const accessKey = localStorage.getItem('awsAccessKey');
    const secretKey = localStorage.getItem('awsSecretKey');

    AWS.config.update({
        region: 'us-west-2', // Change to your region
        credentials: new AWS.Credentials({
            accessKeyId: accessKey,
            secretAccessKey: secretKey
        })
    });

    const iam = new AWS.IAM();

    // Create IAM user
    iam.createUser({ UserName: studentName }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            alert('Failed to create IAM user. Please check your credentials and try again.');
        } else {
            generateLoginCredentials(studentName, studentEmail);
        }
    });
});

// Function to generate login credentials and send email
function generateLoginCredentials(studentName, studentEmail) {
    const iam = new AWS.IAM();

    iam.createAccessKey({ UserName: studentName }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            alert('Failed to create access key for IAM user.');
        } else {
            const loginDetails = `Username: ${studentName}\nAccess Key: ${data.AccessKey.AccessKeyId}\nSecret Key: ${data.AccessKey.SecretAccessKey}`;
            sendEmail(studentEmail, loginDetails);
        }
    });
}

// Function to send email with login details
function sendEmail(email, loginDetails) {
    // Implement your email sending logic using Amazon SES or another email service
    alert(`Email sent to ${email} with login details: \n${loginDetails}`);
}

// Payment page logic
if (window.location.pathname.includes('payment.html')) {
    document.getElementById('paymentForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const paymentMethod = document.getElementById('paymentMethod').value;
        const amount = document.getElementById('amount').value;
        const accountNumber = document.getElementById('accountNumber').value;
        
        // Simulate payment processing
        alert(`Payment of ${amount} has been successfully processed via ${paymentMethod}.`);
        
        // Redirect to a confirmation page or display a confirmation message
        window.location.href = 'index.html'; // Redirect to home
    });
}

// Function to toggle input fields based on payment method
function toggleInputFields() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const amountGroup = document.getElementById('amountGroup');
    const accountNumberGroup = document.getElementById('accountNumberGroup');
    const mobileMoneyOptions = document.getElementById('mobileMoneyOptions');
    const payButton = document.getElementById('payButton');

    // Show options based on selected payment method
    if (paymentMethod === 'mobileMoney') {
        mobileMoneyOptions.style.display = 'block';
        amountGroup.style.display = 'block';
        accountNumberGroup.style.display = 'block';
        payButton.style.display = 'block';
    } else if (paymentMethod) {
        mobileMoneyOptions.style.display = 'none';
        amountGroup.style.display = 'block';
        accountNumberGroup.style.display = 'block';
        payButton.style.display = 'block';
    } else {
        mobileMoneyOptions.style.display = 'none';
        amountGroup.style.display = 'none';
        accountNumberGroup.style.display = 'none';
        payButton.style.display = 'none';
    }
}