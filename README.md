# SOP — Student Operations Portal (UPES Dehradun)

> **Tactile Dark Neumorphic (Deep Soft-UI) Student Dashboard & Bunk Intelligence Sentinel**  
> Designed as an asymmetric Bento Grid for **UPES Dehradun** students to monitor live class schedules, track subject attendance, simulate attendance margins under the UPES 75% rule, view continuous evaluation marks, and bridge live portal records via a built-in CORS Proxy.

---

## 🎨 Visual Design System: Obsidian Slate + Deep Soft-UI

- **Canvas Background:** Obsidian Slate (`#161920`) — deep cool charcoal-blue canvas ensuring sharp dual-directional light/dark neumorphic shadows.
- **Raised Bento Card Surface:** `#1B1F28` with `26px` rounded corners (`rounded-[26px]`).
- **Primary Accent:** Sunset Amber / Gold (`#F59E0B` primary, `#FBBF24` highlight glow, `#D97706` dark amber).
- **Semantic Attendance Zones:**
  - 🟢 **Safe Zone (≥75%):** Emerald (`#34D399`) — Eligible for end-semester examinations.
  - 🟡 **Warning Zone (65–74%):** Warm Amber (`#FBBF24`) — Margin buffer alert.
  - 🔴 **Critical Debarment Zone (<65%):** Coral Red (`#F87171`) — Debarred from exams unless recovered.
- **Neumorphic Dual Shadows:**
  - Raised Cards: `-8px -8px 18px rgba(255, 255, 255, 0.04), 10px 10px 22px rgba(8, 10, 14, 0.75)`
  - Deeply Pressed Inset Wells: `inset 5px 5px 10px rgba(7, 9, 13, 0.85), inset -4px -4px 8px rgba(255, 255, 255, 0.035)`

---

## 🍱 12-Column Bento Grid Architecture

1. **Digital College ID Card (4 cols × 2 rows):**
   - Hologram chip element, amber metallic strip, student avatar with glowing ring, SAP / Global ID (`590039697`) with 1-click copy button, Program (`B.Tech CSE — Global Pathway`), Campus (`Bidholi Campus, Dehradun`), and tactile raised Semester Number Badge (`SEM 01`).
2. **Overall Attendance Ring Card (4 cols × 2 rows):**
   - Deeply inset circular well with animated SVG progress ring (Sunset Amber-to-Gold gradient), aggregate percentage (`82.4%`), classes attended vs. conducted count, and bunk margin cushion.
3. **Today's Timetable — "Up Next" Card (4 cols × 2 rows):**
   - Highlights live current / upcoming class with active border, countdown pill, classroom/lab location (e.g. `Block 9 • Room 304`), faculty, and compact scrollable list of remaining slots today.
4. **Subject-Wise Attendance & Bunk Radar (7 cols × 3 rows):**
   - Enrolled subjects with deeply pressed inset progress bars, exact `Attended / Total` counts, automated Bunk / Recovery advice pill (*"Can skip 3 classes"* or *"Attend next 2 for 75%"*), and instant interactive +1 Attend / +1 Bunk buttons.
5. **Academics & Grades (5 cols × 3 rows):**
   - Prominent CGPA / SGPA metric displays in `JetBrains Mono`, degree credit progression bar (23 / 160 credits), and semester grade points.

---

## 🚀 Dedicated Views & Features

- **Overview:** Main 12-column Bento dashboard.
- **Attendance & Bunk Simulator:** Full mathematical "What-If" simulator where students can select any subject and simulate attending or skipping future classes to immediately see the resulting percentage and debarment risks.
- **Weekly Timetable:** Mon–Sat schedule with Lecture, Lab, and Tutorial filters and UPES Bidholi Campus block locations.
- **Academics & Grades:** Complete Continuous Evaluation matrix (Internals 30, Mid Sem 30, End Sem 40, Total 100), letter grades, and an interactive Target SGPA predictor.
- **Connect / Customize Modal:** Easily update student profile details, test the `/api/proxy/[...path]` route, or export/import configuration JSON.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom Soft-UI Neumorphic Shadow Engine
- **Motion:** Framer Motion
- **Icons:** Lucide React

---

## 📦 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the portal.
