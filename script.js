// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    addDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp,
    orderBy,
    getDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- FIREBASE CONFIGURATION ---
// TODO: Replace with your own Firebase project configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiIUhDuEkbxSZ0x6y0uiF4I42ys5OOmcI",
  authDomain: "clinic-3c656.firebaseapp.com",
  projectId: "clinic-3c656",
  storageBucket: "clinic-3c656.firebasestorage.app",
  messagingSenderId: "31107802602",
  appId: "1:31107802602:web:670e12e7ec82831bcabe93",
  measurementId: "G-V2H88YC7G1"
};

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log("Firebase Initialized Successfully");

// --- PAGE ROUTING & AUTH STATE ---
onAuthStateChanged(auth, async (user) => {
    const path = window.location.pathname;
    console.log("Auth state changed. User:", user, "Current Path:", path);

    if (user) {
        // User is logged in, get their role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userRole = userDoc.exists() ? userDoc.data().role : null;
        console.log("User role:", userRole);

        if (isLoginPage(path)) {
            // If on login page, redirect to appropriate dashboard
            if (userRole === "doctor") {
                window.location.href = "doctor.html";
            } else if (userRole === "receptionist") {
                window.location.href = "receptionist.html";
            } else {
                console.error("Unknown user role, cannot redirect:", userRole);
            }
        } else if (path.includes("doctor.html")) {
            loadPatientsForDoctor();
        } else if (path.includes("receptionist.html")) {
            loadPatientsForReceptionist();
        }

    } else {
        // User is logged out
        if (path.includes("receptionist.html") || path.includes("doctor.html")) {
            window.location.href = "index.html";
        }
    }
});

// --- HELPER FUNCTIONS ---
const getEl = (id) => document.getElementById(id);
const isLoginPage = (path) => path.includes("index.html") || path === "/" || path.endsWith("/clinic-project/");

// --- LOGIN & SIGNUP PAGE LOGIC ---
if (isLoginPage(window.location.pathname)) {
    console.log("Login page script running...");
    const loginForm = getEl("login-form");
    const signupForm = getEl("signup-form");
    const showSignup = getEl("show-signup");
    const showLogin = getEl("show-login");
    const loginContainer = getEl("login-container");
    const signupContainer = getEl("signup-container");

    if (loginForm && signupForm) {
        showSignup.addEventListener("click", (e) => {
            e.preventDefault();
            loginContainer.classList.add("hidden");
            signupContainer.classList.remove("hidden");
        });

        showLogin.addEventListener("click", (e) => {
            e.preventDefault();
            signupContainer.classList.add("hidden");
            loginContainer.classList.remove("hidden");
        });

        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Signup form submitted.");
            const name = getEl("signup-name").value;
            const email = getEl("signup-email").value;
            const password = getEl("signup-password").value;
            const role = getEl("signup-role").value;

            if (!role) {
                alert("Please select a role.");
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Add user details and role to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    email: email,
                    role: role
                });

                alert("Signup successful! You will be redirected.");
            } catch (error) {
                console.error("Signup Error:", error);
                alert(`Error: ${error.message}`);
            }
        });

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Login form submitted.");
            const email = getEl("login-email").value;
            const password = getEl("login-password").value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                console.error("Login Error:", error);
                alert(`Error: ${error.message}`);
            }
        });
    } else {
        console.error("Login or Signup form not found on the page.");
    }
}

// --- LOGOUT LOGIC ---
if (getEl("logout-btn")) {
    getEl("logout-btn").addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "index.html";
        } catch (error) {
            console.error("Logout Error:", error);
            alert(`Error: ${error.message}`);
        }
    });
}

// --- RECEPTIONIST DASHBOARD LOGIC ---
if (window.location.pathname.includes("receptionist.html")) {
    const addPatientForm = getEl("add-patient-form");

    addPatientForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const patientName = getEl("patient-name").value;
        const patientAge = getEl("patient-age").value;
        const patientDetails = getEl("patient-details").value;

        try {
            const token = Date.now();
            await addDoc(collection(db, "patients"), {
                name: patientName,
                age: parseInt(patientAge),
                details: patientDetails,
                token: token,
                status: "waiting",
                createdAt: serverTimestamp(),
                billed: false // New field to track billing status
            });
            alert(`Patient added successfully! Token: ${token}`);
            addPatientForm.reset();
            loadPatientsForReceptionist();
        } catch (error) {
            console.error("Add Patient Error:", error);
            alert(`Error adding patient: ${error.message}`);
        }
    });
}

async function loadPatientsForReceptionist() {
    const patientsList = getEl("patients-list");
    if (!patientsList) return;
    patientsList.innerHTML = "";

    const q = query(collection(db, "patients"), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const patient = doc.data();
        const row = document.createElement("tr");

        let actionButtonHTML = '';
        if (patient.status === 'waiting') {
            actionButtonHTML = `<button class="action-btn complete-btn" data-id="${doc.id}">Mark Complete</button>`;
        } else {
            actionButtonHTML = `<button class="action-btn delete-btn" data-id="${doc.id}">Delete</button>`;
        }

        let billingButtonHTML = '';
        if (patient.status === 'completed' && !patient.billed) {
            billingButtonHTML = `<button class="action-btn bill-btn" data-id="${doc.id}" data-name="${patient.name}">Create Bill</button>`;
        } else if (patient.billed) {
            billingButtonHTML = `<span>Billed</span>`;
        }


        row.innerHTML = `
            <td>${patient.token}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.status}</td>
            <td>${actionButtonHTML}</td>
            <td>${billingButtonHTML}</td>
        `;
        patientsList.appendChild(row);
    });
}


// --- DOCTOR DASHBOARD LOGIC ---
async function loadPatientsForDoctor() {
    const doctorPatientsList = getEl("doctor-patients-list");
    if (!doctorPatientsList) return;
    doctorPatientsList.innerHTML = "";

    const q = query(collection(db, "patients"), where("status", "==", "waiting"), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const patient = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${patient.token}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.details}</td>
            <td>
                <button class="action-btn view-btn" data-id="${doc.id}">Add Prescription</button>
            </td>
        `;
        doctorPatientsList.appendChild(row);
    });
}

// --- Event delegation for action buttons ---
document.addEventListener('click', async (e) => {
    // Handle "Mark Complete" button
    if (e.target.classList.contains('complete-btn')) {
        const patientId = e.target.dataset.id;
        if (confirm("Are you sure you want to mark this patient as completed?")) {
            const patientDocRef = doc(db, "patients", patientId);
            await updateDoc(patientDocRef, { status: "completed" });
            loadPatientsForReceptionist();
            alert("Patient status updated.");
        }
    }

    // Handle "Add Prescription" button
    if (e.target.classList.contains('view-btn')) {
        const patientId = e.target.dataset.id;
        const prescription = prompt("Enter prescription for this patient:");
        if (prescription) {
            const patientDocRef = doc(db, "patients", patientId);
            await updateDoc(patientDocRef, { 
                prescription: prescription,
                status: "completed" 
            });
            loadPatientsForDoctor();
            alert("Prescription saved and patient marked as completed.");
        }
    }

    // Handle "Delete" button
    if (e.target.classList.contains('delete-btn')) {
        const patientId = e.target.dataset.id;
        if (confirm("Are you sure you want to permanently delete this patient record?")) {
            try {
                const patientDocRef = doc(db, "patients", patientId);
                await deleteDoc(patientDocRef);
                loadPatientsForReceptionist();
                alert("Patient record deleted.");
            } catch (error) {
                console.error("Delete Error:", error);
                alert("Error deleting patient record.");
            }
        }
    }

    // Handle "Create Bill" button
    if (e.target.classList.contains('bill-btn')) {
        const patientId = e.target.dataset.id;
        const patientName = e.target.dataset.name;

        const consultationFee = parseFloat(prompt("Enter Consultation Fee (₹):"));
        const medicineCharges = parseFloat(prompt("Enter Medicine Charges (₹):"));

        if (!isNaN(consultationFee) && !isNaN(medicineCharges)) {
            const totalAmount = consultationFee + medicineCharges;

            try {
                // Create a new bill in the 'bills' collection
                await addDoc(collection(db, "bills"), {
                    patientId: patientId,
                    patientName: patientName,
                    consultationFee: consultationFee,
                    medicineCharges: medicineCharges,
                    totalAmount: totalAmount,
                    createdAt: serverTimestamp()
                });

                // Update the patient's record to mark them as billed
                const patientDocRef = doc(db, "patients", patientId);
                await updateDoc(patientDocRef, { billed: true });

                // Display the bill details
                alert(`--- Bill Generated ---\n\nPatient: ${patientName}\nConsultation: ₹${consultationFee}\nMedicines: ₹${medicineCharges}\n--------------------\nTotal: ₹${totalAmount}`);
                
                loadPatientsForReceptionist(); // Refresh the list
            } catch (error) {
                console.error("Billing Error:", error);
                alert("Error creating bill.");
            }
        } else {
            alert("Invalid input. Please enter numbers only for fees.");
        }
    }
});
