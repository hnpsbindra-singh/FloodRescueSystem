# 🚨 FLOOD RESCUE SYSTEM — Frontend

Emergency operations frontend for the Flood Rescue System. Built with React + Vite.

## Theme
Parrot Green (`#39ff14`) on Black — Emergency Operations aesthetic with scanlines, monospace fonts, and live alert tickers.

## Roles
| Role    | Access |
|---------|--------|
| ADMIN   | All reports, NGO requests, donations, heatmap |
| DONOR   | Browse NGO requests, donate, track donations |
| NGO     | Create resource requests, accept/deliver donations |
| VICTIM  | File flood reports, view danger heatmap |

## Setup

```bash
npm install
npm run dev
```

App runs on **http://localhost:5173**  
Backend expected at **http://localhost:8080**

## API Proxy
Vite proxies `/api/**` → `http://localhost:8080` automatically in dev.

## Auth Flow
1. Register → OTP sent via email → Verify OTP → Login → JWT issued
2. JWT stored in localStorage, sent as `Authorization: Bearer <token>`
3. Role extracted from JWT payload for route guarding

## Key Files
```
src/
  App.jsx                   # Router + auth guards
  context/AuthContext.jsx   # JWT state + login/logout
  services/api.js           # All API calls
  components/
    Layout.jsx              # Sidebar + ticker wrapper
    Sidebar.jsx             # Role-aware navigation
    EmergencyTicker.jsx     # Top red alert banner
    HeatmapTable.jsx        # Shared heatmap display
    StatCard.jsx            # Dashboard stat widgets
  pages/
    auth/                   # Login, Register, ForgotPassword
    admin/                  # Dashboard + Reports/NGOReqs/Donations/Heatmap
    donor/                  # Dashboard + Requests/Donate/MyDonations/Heatmap
    ngo/                    # Dashboard + CreateRequest/MyRequests/Donations/Heatmap
    victim/                 # Dashboard + Report/MyReports/Heatmap
```
