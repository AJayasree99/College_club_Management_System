# College Club Management System

The College Club Management System is a web-based application designed to digitally manage college club activities such as member management, authentication, and dashboard-based operations. The system helps clubs maintain organized records of members, streamline administrative tasks, and ensure secure access using authentication.

This project is built using React (Vite) for the frontend and Firebase for authentication and real-time database management.

## 1. Tech Stack (What this project uses)

- React (Vite)
- React Router
- Firebase Authentication
- Firebase Firestore (database)
- Tailwind CSS

---

## 2. Features (What you can do)

- Email / password login and registration
- Protected dashboard (only logged-in users can access)
- Manage **Members**
  - Add new members
  - View list of members
  - Delete members
- Manage **Events**
  - Create events with title, description, venue, etc.
  - View all upcoming / past events
- **Feed / Posts** section for club announcements
- Dashboard with total members, total events and recent posts

---

## 3. Before you start

### 3.1. Install Node.js

1. Install **Node.js** (version 18 or higher is recommended).
2. You can check the version by running:

   ```bash
   node -v
   ```

### 3.2. Open the project folder

Open this folder in your IDE or terminal:

```text
C:\Users\jayas\CascadeProjects\college-club-management
```

Make sure all commands below are run **inside this folder**.

---

## 4. Install dependencies (only once)

Run this command in the terminal:

```bash
npm install
```

This will download all the required packages into the `node_modules` folder.

---

## 5. Firebase configuration (.env.local)

This project uses Firebase for login and database.

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) and create a **Firebase project** (if you have not already).
2. Enable:
   - **Authentication** (Email/Password)
   - **Firestore Database**
3. Go to your Firebase project settings and find your **Web app config**.
4. In the project root (`college-club-management`), create a file named **`.env.local`**.
5. Put your Firebase config values like this:

   ```bash
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

> If this file is already set up and the app is working, you do **not** need to change it.

---

## 6. How to run the project (development)

1. Open a terminal in the project folder:

   ```text
   C:\Users\jayas\CascadeProjects\college-club-management
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Wait until you see something like:

   ```text
   VITE vX.X.X  ready in XXXX ms
   ➜  Local:   http://localhost:5173/
   ```

4. Open this URL in your browser:

   - Main app / Login page:
     - `http://localhost:5173/`
   - Login route (same screen):
     - `http://localhost:5173/login`
   - Dashboard (after successful login):
     - `http://localhost:5173/dashboard`

5. Keep the terminal window **running** while you use the app. If you close it, the site will stop.

---

## 7. Basic usage

- Open `http://localhost:5173/` in your browser.
- Click **GET STARTED** and either:
  - Go to **Register** to create a new account (first time), or
  - Use **Login** if you already have an account.
- After login you can:
  - Open **Dashboard** to see stats.
  - Open **Members** to add / delete members.
  - Open **Events** to add events.
  - Open **Feed** to post updates.

Data (members, events, posts) is stored in **Firestore**, so it will **not be deleted** when you refresh the page.

---

## 8. Notes

- Do **not** commit your `.env.local` file to any public repository (it contains private keys).
- If `npm run dev` fails, make sure you are inside the correct folder and that `npm install` has been run.
- This project is intended as a simple, clear example of a college club management web app.
## 9.RESULTS
The College Club Management System was successfully developed using React and Firebase, and it achieved all the intended objectives. The system provides a smooth and user-friendly interface for managing club members efficiently.

The application allows authorized users to add new members, view member details, search members by name or department, and delete members when required. All operations are performed in real time using Firebase Firestore, ensuring instant data updates without page reloads.

The system demonstrates real-time synchronization, meaning any change made (add or delete member) is immediately reflected in the members list. Local storage caching improves performance by enabling faster data loading during reloads.

Form validation ensures that incomplete or incorrect data is not submitted, improving data accuracy. The search feature helps users quickly find members, enhancing usability and management efficiency.

Overall, the project successfully delivers a secure, scalable, and real-time club management solution, reducing manual work and improving record management.
