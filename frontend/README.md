# 🌸 ZenStyle Salon - React Frontend

Modern, Zen-inspired frontend application for ZenStyle Salon built with React, Vite, and Tailwind CSS.

## ✨ Features

### 🎨 Design Philosophy
- **Zen-inspired UI**: Calm, minimalist design with earth tones
- **Smooth Animations**: Framer Motion for elegant transitions
- **Responsive**: Mobile-first, works on all devices
- **Modern Stack**: React 18, Vite, Tailwind CSS 3

### 📱 Pages
1. **Home** - Landing page with hero section and features
2. **Services** - Browse and filter salon services
3. **Products** - View hair care products
4. **Booking** - Schedule appointments
5. **Blog** - News and beauty tips
6. **About** - Company information
7. **Contact** - Contact form and map
8. **Auth** - Login & Register
9. **Dashboards**:
   - Client Dashboard (appointments, orders)
   - Admin Dashboard (statistics, management)
   - Staff Dashboard (work schedule)

### 🔐 Authentication
- JWT-based authentication via Laravel Sanctum
- Role-based access control (Admin, Stylist, Client)
- Protected routes with automatic redirect

### 🎯 Key Features
- Real-time API integration with Laravel backend
- Appointment booking system
- Service & product catalogs
- User profile management
- Statistics dashboard for Admin

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm or yarn
- Laravel backend running on `http://localhost:8000`

### Installation

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run on `http://localhost:3000`

## 📦 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── ProtectedRoute.jsx
│   │   └── Layout/
│   │       ├── Layout.jsx
│   │       ├── Navbar.jsx
│   │       └── Footer.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Services.jsx
│   │   ├── Products.jsx
│   │   ├── Booking.jsx
│   │   ├── Blog.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── Dashboard/
│   │       ├── ClientDashboard.jsx
│   │       ├── AdminDashboard.jsx
│   │       └── StaffDashboard.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── dataService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

## 🎨 Tailwind Configuration

### Zen Color Palette

```js
colors: {
  zen: {
    50: '#f9f7f4',   // Lightest
    100: '#f3ede3',
    200: '#e7dbc7',
    300: '#d6c3a3',
    400: '#c4a77d',
    500: '#b38f5d',
    600: '#9d7a4f',
    700: '#826243',
    800: '#6b5139',
    900: '#584430',  // Darkest
  },
  cream: '#FFF8F0',
  sage: '#9CAF88',   // Soft green
  earth: '#8B7355',  // Brown
  stone: '#C9B8A8',  // Beige
}
```

### Custom Components

```jsx
// Buttons
<button className="btn-zen">Primary Button</button>
<button className="btn-zen-outline">Outline Button</button>

// Cards
<div className="card-zen">Card Content</div>

// Inputs
<input className="input-zen" />

// Sections
<section className="section-zen">
  <div className="container-zen">
    Content
  </div>
</section>
```

## 🔌 API Integration

### Configuration

API base URL is configured in `src/services/api.js`:

```js
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})
```

### Services Available

- `authService` - Login, Register, Logout
- `serviceService` - Get services, CRUD operations
- `productService` - Get products, CRUD operations
- `appointmentService` - Book, view, cancel appointments
- `customerService` - Customer statistics (Admin only)
- `staffService` - Staff statistics (Admin only)

### Example Usage

```jsx
import { serviceService } from '../services/dataService'

const fetchServices = async () => {
  try {
    const data = await serviceService.getAll()
    setServices(data.data)
  } catch (error) {
    console.error(error)
  }
}
```

## 🎭 Authentication Flow

1. User logs in via `/login`
2. Token stored in `localStorage`
3. Token automatically added to all API requests
4. User redirected to appropriate dashboard based on role
5. Protected routes check authentication status

```jsx
// Protected route example
<Route 
  path="/dashboard/admin" 
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components use Tailwind's responsive utilities:

```jsx
className="text-lg md:text-xl lg:text-2xl"
```

## 🎨 Animations

Using Framer Motion for smooth animations:

```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

## 🛠️ Development

### Available Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create `.env` file in frontend folder:

```env
VITE_API_URL=http://localhost:8000/api
```

## 📦 Build for Production

```bash
# Build
npm run build

# Output will be in /dist folder
# Deploy to any static hosting service
```

## 🌐 Deployment Options

- **Vercel**: Connect GitHub repo, auto-deploy
- **Netlify**: Drag & drop /dist folder
- **AWS S3**: Upload to S3 bucket
- **GitHub Pages**: Use gh-pages package

## 🎯 Demo Accounts

Test the application with these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@zenstyle.com | admin123 |
| **Staff** | minh@zenstyle.com | 123456 |
| **Client** | client@example.com | 123456 |

## 🐛 Troubleshooting

### CORS Issues

Make sure Laravel backend allows requests from `http://localhost:3000`:

```php
// config/cors.php
'allowed_origins' => ['http://localhost:3000'],
```

### API Not Working

1. Check Laravel server is running on port 8000
2. Verify API endpoint in `src/services/api.js`
3. Check browser console for errors
4. Verify token in localStorage

### Styling Issues

```bash
# Rebuild Tailwind
npm run dev
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router](https://reactrouter.com/)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📝 License

MIT License - ZenStyle Salon 2026

---

**Built with ❤️ and Zen philosophy**
