# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

This installs Next.js, React, Anthropic SDK, and all other dependencies.

### Step 2: Get Your API Key (1 minute)

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new key
5. Copy it (starts with `sk-ant-`)

### Step 3: Run the App (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Enter API Key (30 seconds)

Paste your API key in the input field and click "Continue"

### Step 5: Generate Your First UI (1 minute)

Try these prompts:

**Simple:**
```
Create a login form with email and password
```

**Medium:**
```
Build a dashboard with a navbar, 3 metric cards, and a data table
```

**Complex:**
```
Create a user profile page with a sidebar, profile card, settings form, and activity chart
```

---

## 🎮 What to Try

### 1. Basic Generation
```
"Create a signup form"
```
→ See the AI plan, generate, and explain

### 2. Incremental Editing
```
First: "Create a dashboard"
Then: "Add a modal for settings"
```
→ Watch it modify existing code, not regenerate

### 3. Version History
1. Generate a UI
2. Modify it 2-3 times
3. Click "History" button
4. Click any previous version to restore it

### 4. Download Code
1. Generate any UI
2. Click "Download" button
3. Get the React component as `.tsx` file

---

## 📋 Example Prompts

### Forms
- "Create a contact form with name, email, and message"
- "Build a multi-step registration form"
- "Make a survey form with radio buttons"

### Dashboards
- "Create an analytics dashboard"
- "Build a sales dashboard with charts"
- "Make an admin panel with sidebar"

### Data Display
- "Show a table of users with pagination"
- "Create a product catalog with cards"
- "Display a timeline of events"

### Interactive
- "Build a todo list with add/remove buttons"
- "Create a settings panel with modal"
- "Make a notification center"

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules .next
npm install
```

### API Key not working
- Check it starts with `sk-ant-`
- Verify you have credits at console.anthropic.com
- Try pasting it again (no extra spaces)

### Preview not updating
- Check browser console for errors
- Try clicking "Regenerate"
- Refresh the page

### Code not generating
- Check your internet connection
- Verify API key is correct
- Look at browser console for error messages

---

## 💡 Pro Tips

1. **Be Specific**: "Create a login form with email and password fields and a blue submit button" works better than "make a form"

2. **Iterate Gradually**: Make one change at a time for best results
   - ❌ "Add a modal, change colors, add a chart"
   - ✅ "Add a modal" → "Now add a chart"

3. **Use History**: Don't be afraid to try things - you can always roll back

4. **Edit the Code**: The code editor is live - you can manually edit and see changes

5. **Download Early**: Download code you like before making risky changes

---

## 🎯 Next Steps

1. Read the full [README.md](README.md) for architecture details
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) to deploy your own
3. Explore [EXAMPLE_OUTPUT.tsx](EXAMPLE_OUTPUT.tsx) to see what gets generated
4. Try increasingly complex UIs to test the limits

---

## ❓ FAQ

**Q: Can I use my own components?**
A: Not in this version - the library is fixed by design for determinism

**Q: Can I change the styling?**
A: Component styles are fixed, but you can manually edit the code

**Q: Does it work offline?**
A: No, it needs internet to call the Anthropic API

**Q: How much does it cost?**
A: ~$0.01 per UI generation with Claude Sonnet 4

**Q: Can I deploy this?**
A: Yes! See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions

---

**Need Help?** Check the browser console for error messages or open an issue on GitHub.

**Ready to Deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md)

**Want to Understand How It Works?** Read [README.md](README.md)
