# PassPorto 📷

**100% In-Browser Biometric Passport, Visa & ID Photo Studio with 4×6" Printable Sheet Generator**

PassPorto is a privacy-first, zero-cloud web application that creates official biometric passport, visa, and ID photos directly in your browser.

🌐 **Live Web Application**: [https://passporto.grassroot.digital](https://passporto.grassroot.digital) (Mirror: [https://passporto-digital.web.app](https://passporto-digital.web.app))  
🚀 **Grassroot Digital Hub**: [https://grassroot.digital](https://grassroot.digital)

---

## ✨ Features

- 🎯 **Smart Biometric Auto-Centering**: In-browser FaceDetector API + skin/edge centroid analysis auto-centers eyes and scales head to strict 70–80% embassy guidelines.
- 🛂 **Global Standard Presets**:
  - **US Passport & Visa**: 2 × 2 inches (51 × 51 mm) @ 300 DPI (600×600 px)
  - **UK / EU / India / Schengen**: 35 × 45 mm @ 300 DPI (413×531 px)
  - **Canada Passport**: 50 × 70 mm @ 300 DPI (590×826 px)
  - **China / Japan ID & Visa**: 33 × 48 mm @ 300 DPI (390×567 px)
  - **Australia Passport**: 35 × 45 mm @ 300 DPI
  - **Driver's License & ID Badge**: 30 × 40 mm
  - **Stamp Size**: 1 × 1 inch (25 × 25 mm)
  - **Social & Profile**: LinkedIn (1:1), Instagram Avatar (1:1), Story/Reel (9:16), Landscape (16:9)
- 🖨️ **Printable 4×6" Sheets**: Generates tiled 6 or 8 photo layouts with cutting corner marks, ready to print at CVS, Walgreens, Walmart, or on home photo paper. Export as Ultra High-Res JPEG or 4×6" PDF.
- 🎨 **Studio Adjustments & Backgrounds**: Crisp White, Studio Off-White, Neutral Gray, Studio Light Blue, fine zoom, 90°/slider rotation, brightness, and contrast.
- 🔒 **100% Client-Side Privacy**: Zero server uploads, zero telemetry, zero bandwidth cost. All image processing runs locally in browser memory.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with CSS custom properties (Light default, Dark, Midnight)
- **PDF Generation**: jsPDF
- **Face Detection**: Native browser `FaceDetector` API with Canvas color/centroid fallback

---

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/rjnarwal/passporto.git
cd passporto

# Install dependencies
npm install

# Start local development server
npm run dev
```

---

## 📄 License

MIT © [Rajesh Narwal](https://github.com/rjnarwal) • [Grassroot Digital](https://grassroot.digital)
