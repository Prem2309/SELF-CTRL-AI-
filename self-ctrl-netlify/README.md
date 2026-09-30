# SELF//CTRL - Netlify Deployment Guide

SELF//CTRL is a personalized Human Digital Twin decision intelligence web app powered by Google Gemini.

---

## 🚀 How to Deploy to Netlify in 1 Minute (Drag & Drop)

### Method 1: Netlify Drop (Fastest - No Git required)
1. Go to **[https://app.netlify.com/drop](https://app.netlify.com/drop)** (Sign in to Netlify if not already signed in).
2. Drag and drop the **`self-ctrl-netlify.zip`** file (or the folder) directly into the upload area on Netlify.
3. Netlify will deploy your site in seconds and give you a live URL (e.g. `https://your-site-name.netlify.app`).

---

### Method 2: Deploy from GitHub / Git Repository
1. Push this folder to a GitHub repository.
2. In Netlify dashboard, click **Add new site** > **Import an existing project** > **GitHub**.
3. Select your repository.
4. Netlify will automatically detect:
   - **Publish directory:** `.`
   - **Functions directory:** `netlify/functions`
5. Click **Deploy site**!

---

## 🔑 Environment Variables on Netlify (Optional but Recommended)
To customize your Gemini configuration on Netlify:
1. In your Netlify site dashboard, go to **Site configuration** > **Environment variables**.
2. Add the following variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `GEMINI_MODEL`: `gemini-3.8-flash`
3. Click **Save**. Any new build or function invocation will automatically use your environment key.
