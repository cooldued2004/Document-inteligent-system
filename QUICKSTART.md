# 🚀 Quick Start - New Features Guide

## Getting Started with Enhanced Document Intelligence System

### **Installation & Setup**

1. **Install Dependencies** (already done, but if needed):
```bash
# Backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

2. **Start the Backend**:
```bash
python main.py
# Server runs on http://localhost:8000
```

3. **Start the Frontend**:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173 (or similar)
```

---

## **New Features You Can Use Immediately**

### 1️⃣ **Dark Mode**
- Click the 🌙 button in top-left corner
- Or press **Ctrl+D**
- Your preference is saved automatically

### 2️⃣ **Extract & View Results**
- Upload a PDF or TXT file
- Click "Extract Information"
- See instant statistics dashboard with breakdown

### 3️⃣ **Search Results**
- Use the search box to filter entities
- Works on all extracted data
- Real-time filtering

### 4️⃣ **Export Data**
- Click "Export" button to see options:
  - 📄 JSON - For developers/APIs
  - 📊 CSV - For Excel/Sheets
  - 📋 XML - For integration
  - 📝 TXT - For reading

### 5️⃣ **View History**
- Click 📋 button in top-left (shows count)
- Press **Ctrl+H**
- See your last 10 extractions
- Click any to restore

### 6️⃣ **Keyboard Shortcuts** (Faster Workflow)
```
Ctrl+E   → Extract
Ctrl+K   → Copy to clipboard
Ctrl+H   → Show history
Ctrl+D   → Toggle dark mode
```

---

## **What Gets Extracted Now**

When you extract, you get:
- ✅ Names (persons)
- ✅ Organizations
- ✅ Locations
- ✅ Dates (multiple formats)
- ✅ Email addresses
- ✅ Phone numbers (all formats)
- ✅ IDs (Aadhar, SSN, PAN)
- ✅ Money/Salaries (any currency)
- ✅ URLs/Links
- ✅ File numbers & references
- ✅ Percentages
- ✅ Job titles
- ✅ Skills (technical & professional)
- ✅ Addresses

---

## **Examples**

### Example 1: Resume Extraction
Upload a resume (PDF) to extract:
- Name, email, phone
- Experience (organizations, job titles)
- Skills (programming languages, tools)
- Education locations
- Dates of employment

### Example 2: Business Document
Upload a business document to extract:
- Company names
- Contact information
- Financial amounts
- Dates and timelines
- File references

---

## **Tips & Tricks**

🎯 **Performance Tips**:
- Upload documents under 5MB for faster processing
- Use PDF format for better text extraction
- Ensure text is readable (not scanned images)

📝 **Data Tips**:
- Duplicates are automatically removed
- Entities are deduplicated (case-insensitive)
- All data stays on your computer
- History saves locally (browser storage)

💾 **Export Tips**:
- CSV works great with Excel/Google Sheets
- JSON for APIs and automation
- XML for enterprise systems
- TXT for human reading

---

## **Troubleshooting**

| Issue | Solution |
|-------|----------|
| Dark mode not saving | Clear browser cache, use modern browser |
| No results extracted | Try different PDF, ensure text is readable |
| Export not working | Try different format (CSV, JSON, etc.) |
| History not showing | Enable localStorage in browser settings |
| Slow extraction | Try smaller files or simpler documents |

---

## **Browser Compatibility**

✅ Works best on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## **File Size Limits**

- Maximum file size: No hard limit, but recommended under 10MB
- Processing time: Usually 2-10 seconds
- History: Stores last 10 extractions

---

## **Privacy & Security**

🔒 **Your Data is Safe**:
- All processing happens on your computer
- No data sent to external servers (only your backend)
- History stored locally in browser
- No account or login required

---

## **Need Help?**

Check the main `ENHANCEMENTS.md` file for:
- Detailed feature descriptions
- Technical implementation details
- Keyboard shortcut reference
- Export format examples

---

## **What's Next?**

Future features planned:
- 📸 Document preview
- 📦 Batch processing multiple files
- 🔄 Document comparison
- 🎨 Custom entity types
- 📊 Advanced analytics

---

**Happy Extracting! 🎉**

*Version 2.0 - All New Features Ready*
