# Rhetorically

a freakishly good college essay editor.

## Getting Started

### Tools

- Rquired: Github, Firebase, GCP
- Recommended: install google extensions Reqbin, JSON Formatter

### Steps

- Add .env file into /functions
- Login to the firebase cli
- Run 'cd functions' then 'npm install'

## Testing

### Local Functions

- Run 'cd functions' then 'npm run serve'
  - follow directions in console for accessing the local emulator
- I recommend the following setup:
  - get 'https://rhetorically.collegiate.dev/r/googleSignIn'
  - this will redirect you to google oauth flow, sign in using admin@collegiate.dev
  - copy the value from the 'access_token' key
  - go to https://reqbin.com and add the token into Authorization section
  - you can now test both local and deployed functions!
