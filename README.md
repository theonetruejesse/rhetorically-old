# Rhetorically

a freakishly good college essay editor.

## Getting Started

### Tools

- Rquired: Github, Firebase, GCP
- Recommended: install chrome extensions Reqbin, JSON Formatter

### Steps

- Add .env file into /functions
- Add serviceAccountKey.json into /functions/src
- Login to the firebase cli
- Run 'cd functions' then 'npm install'

## Testing

### Local Functions

- Run 'cd functions' then 'npm run serve'
  - 'npm run serve' only works for testing solely functions, if function uses any other service use 'npm run dev'
  - follow directions in console for local testing (open the Emulator UI link)
- I recommend the following setup:

  - go to 'https://rhetorically.collegiate.dev/r/googleSignIn'
  - this will redirect you to google oauth flow, sign in using admin@collegiate.dev
  - copy the value from the 'access_token' key
  - go to https://reqbin.com and add the token into Authorization section
  - you can now test both local and deployed functions!

## Prompting

- Prompt: see ./prompt.md
- Knowledge: https://drive.google.com/drive/folders/105EiwJgIgSr29EeLfGNxRhG2wTzHjiWk?usp=drive_link

Recommended Workflow:

1. Download obsidian.md and upload all knowledge from drive
2. Edit the documents, make sure to take advantage of the linking feature
3. Upload the markdown documents into Rhetorically
4. Save the new version of the documents to drive in folder named with the upload date
