# Smart House Registration and Family Management System

An enterprise-grade, modern, full-stack administrative platform for registering residential properties, recording owner and family census data, capturing geodetic GPS coordinates on interactive maps, securely uploading house photographs, and generating multi-page PDF certificates and 4-sheet formatted Excel workbooks.

Built as a college major project / municipal production demonstration application.

---

## 🏛️ System Features & Highlights

- **15 Complete Functional Pages**:
  1. **Login Page** — Authenticated role-based access with demo one-click credentials.
  2. **Dashboard** — Live statistics aggregated from database, house-type distribution chart, monthly trends, and recent registrations table.
  3. **Register House** — Multi-section wizard with field validation, auto-generated IDs, GPS capture, owner details, dynamic family members, and photo uploader.
  4. **House Records** — Master table with search (ID, owner, locality), filters (type, status, locality), column sorting, multi-select checkboxes, and bulk export.
  5. **House Details** — Complete property dossier, interactive Leaflet GPS map, owner profile, family table, photo lightbox, QR verification code, PDF, Excel, and Print actions.
  6. **Edit House Registration** — Full CRUD modification of house data, owner information, and GPS coordinates.
  7. **Owner Details** — Directory of house owners and correspondence addresses.
  8. **Family Member Management** — Cross-house census directory to list, add, edit, and remove household members.
  9. **House Photo Gallery** — Filterable visual archive categorized by Front view, Exterior, Interior, and Other with image lightbox.
  10. **GPS & Map View** — Full-screen interactive OpenStreetMap view plotting all registered properties with popup cards and locality filtering.
  11. **Registration Summary** — Formal municipal certificate layout with QR code, formatted headings, and direct print readiness.
  12. **PDF & Excel Export** — Comprehensive export center for bulk PDF compilation and 4-sheet Excel (.xlsx) workbooks.
  13. **User Management** — Administrator console to create, update, and manage staff/admin/viewer accounts with Role-Based Access Control.
  14. **Settings** — Issuing authority profile configuration, contact details, map defaults, report disclaimer text, and user password update.
  15. **Not Found Page (404)** — Custom styled error page with navigation fallbacks.

- **GPS & Leaflet Maps**:
  - Browser Geolocation API integration ("Capture Current GPS Location" button).
  - Drag-and-drop marker positioning on OpenStreetMap tiles.
  - Manual coordinate synchronization with latitude/longitude inputs.
  - Direct "Open in Google Maps" links.
  - Geodetic accuracy radius tracking.

- **Document Export Engineering**:
  - **PDF Generation (PDFKit)**: Multi-page document layout, verification QR code, property attributes, GPS geodetic data, owner block, family member table, embedded photo thumbnails, page numbers, and official legal disclaimers.
  - **Excel Generation (ExcelJS)**: Real 4-sheet `.xlsx` workbook containing:
    - *Sheet 1*: House Details
    - *Sheet 2*: Owner Details
    - *Sheet 3*: Family Details
    - *Sheet 4*: Photo References
    - Styled with bold white-on-navy headers, auto-filters, frozen top rows, zebra row striping, and column auto-widths.
  - **Bulk Export**: Checkboxes to select multiple properties and generate consolidated reports or workbooks.

- **Database Integrity & Cascading**:
  - Auto-generated sequential IDs (`HR-1001`, `OWN-1001`, `FAM-1001`, `PHT-1001`).
  - Cascading deletion: deleting a house cleanly wipes linked owner, family member documents, and unlinks physical photo files from disk storage.

---

## 💻 Tech Stack

- **Frontend**:
  - React 18 with Vite
  - Tailwind CSS (Professional Navy Blue `#0f172a`, Light Slate `#f8fafc`, Royal Blue `#2563eb`)
  - React Router v6
  - Leaflet & React-Leaflet (OpenStreetMap)
  - Axios for HTTP API requests
  - Lucide React icons
- **Backend**:
  - Node.js & Express.js
  - RESTful Architecture
  - MongoDB & Mongoose
  - Multer for secure disk file storage
  - PDFKit & QRCode for PDF report rendering
  - ExcelJS for multi-sheet `.xlsx` workbooks
  - Bcrypt & JSON Web Tokens (JWT) for authentication
  - Helmet & Express Rate Limiting for API protection

---

## 📁 Project Structure

```text
house-registration-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & in-memory fallback
│   ├── controllers/
│   │   ├── authController.js     # Login, logout, session, password
│   │   ├── dashboardController.js# Aggregated stats, trends, charts
│   │   ├── houseController.js    # CRUD, search, filter, pagination
│   │   ├── ownerController.js    # Owner listing and updating
│   │   ├── familyController.js   # Family member management
│   │   ├── photoController.js    # Upload, gallery, secure streaming
│   │   ├── exportController.js   # PDF and Excel generation
│   │   ├── userController.js     # Admin user management
│   │   └── settingsController.js # Authority profile settings
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & RBAC check
│   │   ├── uploadMiddleware.js   # Multer file validation (JPG/PNG/WebP, 5MB)
│   │   ├── errorHandler.js       # Centralized error handler
│   │   └── rateLimiter.js        # API rate limits
│   ├── models/
│   │   ├── User.js               # User authentication model
│   │   ├── House.js              # House property & GPS model
│   │   ├── Owner.js              # Owner details model
│   │   ├── FamilyMember.js       # Household member model
│   │   ├── HousePhoto.js         # Photo metadata model
│   │   └── Settings.js           # System settings model
│   ├── routes/                   # Express route definitions
│   ├── services/
│   │   ├── pdfService.js         # PDFKit report generator
│   │   ├── excelService.js       # ExcelJS 4-sheet workbook builder
│   │   └── qrService.js          # QR code generator
│   ├── utils/
│   │   ├── idGenerator.js        # Sequential ID generation
│   │   └── seedData.js           # Default admin accounts & realistic sample data
│   ├── uploads/houses/           # Protected disk storage for uploaded photos
│   ├── server.js                 # Express server entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Sidebar, Modal, StatCard, etc.
│   │   │   ├── forms/            # FamilyMemberForm, PhotoUploader
│   │   │   └── map/              # LocationPickerMap, HouseLocationMap
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication state & role helpers
│   │   │   └── ToastContext.jsx  # Toast notifications provider
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # Responsive shell with collapsible nav
│   │   ├── pages/                # All 15 functional application pages
│   │   ├── services/             # Axios API client calls & export downloaders
│   │   ├── App.jsx               # Protected routes configuration
│   │   ├── main.jsx              # React DOM bootstrap
│   │   └── index.css             # Tailwind base styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                  # Root orchestrator scripts
├── .env.example                  # Environment variable reference
└── README.md                     # Comprehensive documentation
```

---

## 🚀 Installation & Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string).
  *Note*: The backend features an automatic in-memory fallback layer via `mongodb-memory-server` if local MongoDB is temporarily offline.

### 2. Configure Environment Variables

**Backend (`backend/.env`)**:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_house_db
JWT_SECRET=smart_house_secure_dev_jwt_key_2026_antigravity_token
JWT_EXPIRES_IN=7d
APP_BASE_URL=http://localhost:5173
UPLOAD_PATH=uploads/houses
MAX_FILE_SIZE_MB=5
NODE_ENV=development
```

### 3. Install Dependencies

In the root directory or inside `backend` and `frontend`:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Run the Application

Open two terminal windows:

**Terminal 1 — Start the Backend Server**:
```bash
cd backend
npm start
```
*Output:*
```text
[MongoDB] Connected successfully to host: 127.0.0.1
[Seeder] Checking and initializing default data...
[Seeder] Default Admin created: admin / AdminPassword@2026
[Seeder] Created 5 sample house registrations.
Smart House Registration Backend API is running on http://localhost:5000
```

**Terminal 2 — Start the Frontend Dev Server**:
```bash
cd frontend
npm run dev
```
*Output:*
```text
VITE v5.2.11  ready in 320 ms
➜  Local:   http://localhost:5173/
```

Open your browser at `http://localhost:5173`.

---

## 🔐 Default Authentication Credentials

The system initializes with 3 distinct role-based accounts:

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `AdminPassword@2026` | Full access: User management, house CRUD, delete records, exports, settings |
| **Staff / Registrar** | `staff` | `StaffPassword@2026` | Register houses, edit registrations, upload photos, manage family, exports |
| **Viewer / Auditor** | `viewer` | `ViewerPassword@2026` | Read-only access: View houses, inspect GPS maps, export PDF/Excel |

*Tip*: The Login page includes quick one-click buttons to instantly fill credentials for demo and evaluation purposes.

---

## 🧪 Testing Key Workflows (End-to-End)

1. **Admin Login**: Log in using `admin` / `AdminPassword@2026`.
2. **Dashboard Overview**: Check dynamic counts (Houses, Owners, Family members), house-type distribution chart, trends, and recent records.
3. **Register New House**:
   - Go to **Register House** (`/register-house`).
   - Enter House No., Street, Locality, City, District, State, PIN code.
   - Click **Capture Current GPS Location** or click on the Leaflet map to adjust the pin.
   - Enter Owner Name and Contact Phone.
   - Click **Add Member** to dynamically add family members.
   - Attach house photographs (JPG/PNG/WebP, max 5MB).
   - Review pre-submission summary and click **Confirm & Save Registration**.
4. **Inspect House Dossier**: View the newly created house at `/houses/:id`.
   - Verify coordinates on the interactive map.
   - Test photo lightbox by clicking any thumbnail.
   - Check embedded QR verification code.
5. **Download Reports**:
   - Click **Download PDF** to obtain `House_Registration_HR100X.pdf`.
   - Click **Download Excel** to obtain the 4-sheet `.xlsx` workbook.
   - Click **Print Certificate** to preview print-ready certificate.
6. **Bulk Operations**:
   - Navigate to **House Records** (`/houses`).
   - Select multiple houses using checkboxes.
   - Click **Export Selected as PDF** or **Export Selected as Excel**.
7. **Clean Cascading Deletion**:
   - Delete a house record as Admin.
   - Verify that linked Owner and Family Member documents are deleted, and uploaded photo files are physically removed from the server disk.

---

## 🔒 Security Best Practices Implemented

- Password hashing via `bcryptjs` with 10 salt rounds.
- HTTP header hardening with `helmet`.
- Request rate limiting via `express-rate-limit`.
- Role-Based Access Control (RBAC) middleware verifying JWT tokens on every protected endpoint.
- File upload restrictions: strict MIME type and extension validation (`.jpg`, `.jpeg`, `.png`, `.webp`), 5MB size limit, and randomized safe file naming.
- Zero credential exposure: Sensitive fields (passwords, tokens) are omitted from JSON outputs and spreadsheet exports.

---

## 📄 License & Attribution

This project is licensed under the MIT License.
OpenStreetMap tile data is © OpenStreetMap contributors.
