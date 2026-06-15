# 🔐 PIXELCRYPT

### Advanced Image Encryption & Decryption Platform

PIXELCRYPT is a modern image encryption application developed as part of my Cyber Security Internship at Prodigy InfoTech. The platform enables secure image encryption and decryption using pixel manipulation techniques while providing a clean and interactive user experience.

---

## 🚀 Features

* 🔒 **Image Encryption**: Protect your sensitive image files with state-of-the-art pixel scrambling.
* 🔓 **Image Decryption**: Fully restore encrypted images back to their original pixel values using the correct cryptographic key.
* 🖼️ **Real-Time Image Preview**: Visual feedback of your images before and after processing.
* 📤 **Upload Images**: Drag-and-drop or select images in major formats (PNG, JPG, JPEG, WEBP).
* 📥 **Download Encrypted/Decrypted Images**: Export processed images instantly as lossless PNG files.
* 🔑 **Key-Based Encryption**: Customize your encryption using custom alphanumeric security keys.
* 📊 **Security Analytics Dashboard**: Track processing latency, original vs encrypted file size metrics, resolution, and algorithm configuration.
* ⚡ **Fast Processing**: Built-in high-speed array manipulation utilizing NumPy and PIL on the backend.
* 🎨 **Modern Cyber Security UI**: A clean, dark-themed dashboard designed with rich aesthetics and neon accents.
* 📱 **Responsive Design**: Seamlessly accessible across all screen sizes and modern web browsers.

---

## 📸 Screenshots

### Main Dashboard
<img width="1918" height="907" alt="Task 2   1" src="https://github.com/user-attachments/assets/49a32976-8e73-4dd3-abd8-a162cd39331d" />
<img width="1918" height="918" alt="Task2  2" src="https://github.com/user-attachments/assets/31014274-9ede-46a7-9104-7d50cd644019" />



---

## 🛠️ Tech Stack

### Frontend
* **React.js & TypeScript**: Core component framework.
* **Vite**: Ultra-fast next-generation frontend tooling.
* **Tailwind CSS**: Modern utility-first CSS styling.

### Backend
* **Python**: Core scripting language.
* **Flask**: Lightweight web framework for RESTful API.
* **Flask-Cors**: Cross-Origin Resource Sharing handling.

### Libraries
* **Pillow (PIL)**: Python Imaging Library for reading, standardizing, and saving image pixels.
* **NumPy**: Multidimensional array processor for high-speed mathematical operations and pixel transformations.

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/Aathekesavan/PRODIGY_CS_02.git
cd PRODIGY_CS_02
```

### 2. Set Up Backend
Navigate to the `backend` directory, install Python dependencies, and run the server:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
The backend server will start on `http://localhost:5000`.

### 3. Set Up Frontend
Navigate to the `frontend` directory, install packages, and start the development server:
```bash
cd ../frontend
npm install
npm run dev
```
The frontend dev server will start on `http://localhost:5173`.

> [!TIP]
> Alternatively, you can double-click the `run.bat` file in the root directory to launch both nodes automatically in separate command windows.

---

## 🎯 Project Objectives

This project was developed to:
* Understand image encryption concepts.
* Explore pixel manipulation techniques.
* Learn secure image processing.
* Strengthen cybersecurity fundamentals.
* Build practical security-focused applications.

---

## 📚 Learning Outcomes

Through this project, I gained experience in:
* **Image Processing**: Restructuring channel formats, working with binary image data, and handling base64 conversion.
* **Pixel Manipulation**: Mapping matrix coordinates, shuffling arrays, and applying deterministic cryptographic transformations.
* **Data Security Concepts**: Generating deterministic keyspace seeds, ensuring process randomness, and maintaining data integrity.
* **Cryptography Fundamentals**: XOR operations, spatial pixel permutation, and hybrid encryption methods.
* **Full-stack Integration**: Connecting React TypeScript frontend to Python Flask backend via RESTful APIs.

---

## 👨‍💻 Developer

### Aathekesavan R
*Cyber Security Intern*

* **GitHub**: [github.com/Aathekesavan](https://github.com/Aathekesavan)

---

## 🏢 Internship Information

* **Organization**: Prodigy InfoTech
* **Track**: Cyber Security
* **Task**: Task 02 – Image Encryption Tool
* **Project**: PIXELCRYPT – Advanced Image Encryption & Decryption Platform

---

## 🚀 Future Enhancements

* **Advanced Encryption**: Adding AES-based block ciphers and custom key schedules.
* **Multi-Image Processing**: Supporting batch encryption and folder-level actions.
* **Cloud Storage**: Optional encrypted cloud vault backups.
* **Advanced Analytics**: Detailed histogram analysis showing RGB distribution changes after encryption.

---

⭐ If you found this project interesting, consider giving it a star!
