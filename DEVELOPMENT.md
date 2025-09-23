# Development Workflow

## 🚀 **Streamlined Development Setup**

The server automatically detects if a React build exists and serves it, otherwise falls back to vanilla HTML.

### **Development Modes**

#### **Option 1: Frontend Development (Hot Reload)**
For rapid UI development with hot reload:
```bash
npm run dev:ui
# Visit: http://localhost:5173
# - Hot reload for React changes
# - Vite dev server with API proxy to backend
# - Best for UI/UX development
```

#### **Option 2: Full-Stack Testing (Production-like)**
For payment testing and full integration:
```bash
npm run dev:react
# Builds React app → starts backend server
# Visit: http://localhost:3000
# - Serves built React app via Express
# - Matches production environment exactly
# - Best for payment testing with Stripe
```

#### **Option 3: Backend-Only Development**
For backend API development:
```bash
npm run dev
# Visit: http://localhost:3000
# - Serves vanilla HTML if no React build exists
# - Backend changes auto-reload with nodemon
# - Best for API development
```

### **Quick Commands**

| Command | Purpose | Server | URL |
|---------|---------|---------|-----|
| `npm run dev:ui` | Frontend dev | Vite | http://localhost:5173 |
| `npm run dev:react` | Full-stack dev | Express | http://localhost:3000 |
| `npm run dev:react:host` | Network access | Express | http://0.0.0.0:3000 |
| `npm run build:deploy` | Production test | Express | http://localhost:3000 |

### **Development Indicators**

The app automatically shows development mode indicators:

- **🔶 Amber banner**: "Development Mode" at top of page
- **🔵 Blue panel**: Stripe test card numbers in payment section
- Only appear in development/localhost environments

### **Stripe Test Cards**

When in development mode, use these test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`  
- **Any future expiry date and 3-digit CVC**

### **File Structure**

```
donation-widget/
├── src/                     # React source code
├── dist/                    # Built React app (auto-generated)
├── server/server.cjs        # Express backend
├── index.html              # Vanilla HTML (fallback)
└── package.json            # Scripts and dependencies
```

### **How Server Mode Detection Works**

The Express server checks for `/dist/index.html`:
- **React build exists**: Serves React app from `/dist`
- **No React build**: Serves vanilla HTML from root directory
- **Automatic**: No manual configuration needed

### **Railway Deployment**

Production deployment remains the same:
1. `npm run build:ui` - Creates `/dist` folder
2. `npm start` - Express serves built React app + APIs
3. Single Railway service handles everything

### **Troubleshooting**

- **API errors**: Make sure backend is running on port 3000
- **React not loading**: Run `npm run build:ui` to create `/dist`
- **Stripe errors**: Check `.env` file for valid keys
- **Hot reload not working**: Use `npm run dev:ui` for frontend development
