# Chimney Solutions — Health Reports & CRM

A Next.js 14 + Tailwind CSS app (JavaScript only) with:
- Technician report form (QR code creation)
- Public health report viewer with animated decay & warranty
- Admin CRM: login, dashboard, customer list (pagination), edit reports
- MongoDB (native driver), no path aliases, Vercel-ready

## Quick Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Deploy to Vercel and set env vars from `.env.example`.

## Notes
- Admin login: `admin` / `Chimeny@123`
- Warranty: 1 month from service date
- Score decay: Normal cleaning → 6 months; Deep cleaning → 8 months, both down to ~15% with warning at ≤20%.
- Duplicate prevention by name+phone+address on create.
- QR scans are counted each time the report page is opened.
