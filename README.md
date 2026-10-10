# Novamovies 🎬

A full-stack **MERN** movie web application featuring custom authentication, active session takeover handling, and proxy API routing.

 <!-- Replace with a link to your actual app screenshot -->

---

## ✨ Key Features

- **Single Session Authentication:** Prevents multi-device concurrent logins by validating active user sessions in real time.
- **Session Takeover Management:** Features background polling that detects unauthorized external logins and automatically terminates inactive sessions within 4 seconds.
- **Dynamic Movie Catalog:** Seamlessly browse, search, and explore movies with detailed metadata, poster graphics, and summaries.
- **Secure API Proxying:** Includes Vite backend proxy configuration and structured Express RESTful endpoints to secure API requests.
- **Responsive Modern UI:** Styled using Tailwind CSS for an intuitive, mobile-friendly viewing experience across screen sizes.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication & State:** JSON Web Tokens (JWT), React Context / Custom Hooks
- **Dev Tools:** Git, GitHub, Postman

---

## 🚀 Getting Started

Follow these steps to run Novamovies locally on your system:

### Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone [https://github.com/ranashivansh07/Novamovies.git](https://github.com/ranashivansh07/Novamovies.git)
cd Novamovies
