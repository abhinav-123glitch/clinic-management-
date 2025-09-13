Clinic Management System
This is a role-based web application designed to streamline patient management and workflow in a small clinic. Built with vanilla HTML, CSS, and JavaScript, and powered by a Google Firebase backend, it provides separate, secure dashboards for two key roles: Doctors and Receptionists.

The application digitizes the entire patient journey, from registration and token generation to consultation and billing, all updated in real-time.

✨ Features
The system is divided into two primary roles, each with a tailored set of features:

receptionists 👤 Receptionist Features
Secure Login: Receptionists can sign up and log into their dedicated dashboard.

Add New Patients: A simple form to register new patients with their name, age, and brief details. A unique token is automatically generated upon submission.

Real-Time Patient Queue: View a live table of all patients for the day, ordered by their arrival. The table displays the patient's token, name, age, and current status ("waiting" or "completed").

Manual Status Updates: Manually mark a consultation as "complete" if needed.

Billing System: Generate a bill for any patient whose consultation is complete. The system allows for entering consultation and medicine fees to calculate a total.

Delete Records: Remove completed and billed patient records from the daily queue to keep it clean.

🧑‍⚕️ Doctor Features
Secure Login: Doctors can sign up and log into their dedicated dashboard.

Filtered Patient List: The doctor's dashboard shows a clean, filtered list of only the patients who are currently "waiting," allowing them to focus on the next person in the queue.

Add Prescriptions: The primary action for a doctor. Adding a prescription for a patient automatically updates their status to "completed."

Seamless Workflow: Once a prescription is added, the patient is automatically removed from the doctor's waiting list and their status is updated on the receptionist's dashboard, signaling that they are ready for billing.

🛠️ Technology Stack
HTML5: For the core structure of the login/signup pages and the Doctor and Receptionist dashboards.

CSS3: For all custom styling, creating a clean, professional, and responsive user interface.

JavaScript (ES6 Modules): For all application logic, including:

User authentication and role-based page redirection.

Real-time CRUD (Create, Read, Update, Delete) operations with the database.

Dynamic DOM manipulation to update patient lists and statuses without page reloads.

Google Firebase: The backend-as-a-service platform providing:

Firebase Authentication: For secure user sign-up and login.

Firestore Database: A real-time NoSQL database to store user roles, patient data, and bills.

🚀 How to Run the Project
To run this project locally, you will need to set up your own Firebase project.

Clone or Download the Project: Get all the project files (index.html, doctor.html, receptionist.html, style.css, script.js) into a single folder on your local machine.

Create a Firebase Project:

Go to the Firebase Console.

Create a new project.

Add a new "Web App" to your project.

Firebase will provide you with a firebaseConfig object. Copy this object.

Configure the Script:

Open the script.js file.

Find the placeholder firebaseConfig object at the top of the file.

Replace the entire placeholder object with the one you copied from your Firebase project.

Set Up Authentication:

In the Firebase Console, go to the "Authentication" section.

Click on the "Sign-in method" tab.

Enable the "Email/Password" provider.

Set up Firestore Database:

In the Firebase Console, go to the "Firestore Database" section.

Click "Create database" and start in test mode for initial setup (you can add security rules later).

Open in Browser:

Once the configuration is done, simply open the index.html file in any modern web browser.

You can now sign up as a doctor or a receptionist and test the application.

📂 File Structure
The project is organized into five key files:

index.html: The main landing page for user login and signup.

doctor.html: The dashboard for the doctor.

receptionist.html: The dashboard for the receptionist.

style.css: Contains all the styling rules for the entire application.

script.js: The core JavaScript file that handles all logic, authentication, and database interactions for all pages.