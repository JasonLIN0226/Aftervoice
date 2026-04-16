# After Voice

Single-page Next.js artwork exploring what remains of a sentence after it enters a medium.

## Run This Website On Your Computer

These instructions are written for someone who has never run a local website before.

### What you need first

Before you start, make sure you have:

1. This project folder on your computer
2. An internet connection for the first setup
3. Node.js installed

### Step 1: Install Node.js

This project needs Node.js to run.

1. Go to `https://nodejs.org`
2. Download the **LTS** version
3. Open the downloaded installer
4. Click through the installation steps using the default options
5. When the installation finishes, close the installer

If Node.js is already installed, you can skip this step.

If you prefer, Node.js can also be installed with Terminal on macOS:

1. Open Terminal
2. If you already have Homebrew, run:

```bash
brew install node
```

3. If `brew` does not work on your computer, use the normal installer from `https://nodejs.org` instead

### Step 2: Open the project folder

Make sure this project is already on your computer.

If you downloaded it from GitHub as a ZIP file:

1. Unzip the file
2. Move the folder somewhere easy to find, such as your Desktop

### Step 3: Open Terminal

You will run a few commands in Terminal.

On Mac:

1. Press `Command + Space`
2. Type `Terminal`
3. Press `Enter`

On Windows:

1. Open the Start menu
2. Type `PowerShell` or `Command Prompt`
3. Open it

### Step 4: Go into the project folder

In Terminal, type `cd`, then a space, then drag the project folder into the Terminal window. Press `Enter`.

It should look something like this:

```bash
cd /path/to/Aftervoice
```

If you are already inside the project folder in Terminal, you can skip this step.

Examples:

```bash
cd "/Users/your-name/Desktop/Aftervoice"
```

```bash
cd "/Users/your-name/Downloads/Aftervoice"
```

### Step 5: Install the project files it needs

Copy and paste this command into Terminal, then press `Enter`:

```bash
npm install
```

What this does:

- It downloads everything the website needs in order to run
- This may take a minute or two the first time

When it finishes, you should return to a normal command line prompt.

### Step 6: Choose whether to use DeepSeek or the local mode

This project can run in two ways:

- Local mode: no online model call
- DeepSeek mode: uses the DeepSeek API for the text transformation

1. In the main project folder, create a new file named `.env`
2. Open that `.env` file in a text editor
3. Paste one of the following options into the file

If you want the website to run without DeepSeek, use this:

```bash
USE_LLM=false
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

If you want the website to use DeepSeek, use this:

```bash
USE_LLM=true
DEEPSEEK_API_KEY=your_real_deepseek_api_key_here
```

4. Save the file

Important:

- Do not share this key publicly
- `.env` is already set to stay out of GitHub
- If `USE_LLM=true`, you must put in a real DeepSeek API key
- `your_deepseek_api_key_here` is only a placeholder, not a real key
- If `USE_LLM=true` with a missing or placeholder key, the app will warn in Terminal when it starts

### Step 7: Start the website

In Terminal, run:

```bash
npm run dev
```

Wait a few seconds. You should see a local address that looks like this:

```bash
http://localhost:3000
```

### Step 8: Open the website in your browser

1. Open Chrome, Safari, Edge, or Firefox
2. Go to:

```text
http://localhost:3000
```

You should now see the website running on your computer.

### How to stop the website

If the website is running in Terminal and you want to stop it:

1. Click the Terminal window
2. Press `Control + C`

### How to start it again later

Each time you want to use the website again:

1. Open Terminal
2. Go back into the project folder
3. Run:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Troubleshooting

### If `npm install` does not work

Node.js may not be installed correctly.

1. Close Terminal
2. Reinstall Node.js from `https://nodejs.org`
3. Open Terminal again
4. Return to the project folder
5. Run `npm install` again

### If the browser says the page cannot be reached

Usually this means the local server is not running.

1. Go back to Terminal
2. Make sure `npm run dev` is still running
3. If not, start it again

### If DeepSeek is not working

The site should still work without it.

Check these points:

1. Your `.env` file has `USE_LLM=true`
2. Your `.env` file contains a real `DEEPSEEK_API_KEY`
3. You saved the file after editing it
4. You stopped the server with `Control + C`
5. You started it again with `npm run dev`

If `USE_LLM=false`, the app will always use the local fallback transformation.

If `USE_LLM=true` and `DEEPSEEK_API_KEY` is missing or still a placeholder, the app will show a configuration error.

If `USE_LLM=true` and the DeepSeek request fails later for another reason, the app will still fall back to the local transformation.
