# Yelp Biz Photos – My Photos Button

This repository contains a small userscript that adds a **“My Photos”** button next to Yelp’s native **“Add Photos”** button on business photo pages (`/biz_photos/*`). [file:1] Clicking the new button takes you directly to photos you have submitted for that business by appending your Yelp user ID as a `userid=` query parameter to the current URL. [file:1]

## Features

- Detects the **“Add Photos”** button on Yelp business photo pages and inserts a matching **“My Photos”** button beside it. [file:1]  
- Automatically builds a URL of the form:  
  `https://www.yelp.ca/biz_photos/<business-alias>?userid=<your-user-id>` [file:1]  
- Attempts to extract the current logged-in Yelp user ID from profile links or embedded page data. [file:1]  
- Works on both `yelp.ca` and `yelp.com` `biz_photos` pages. [file:1]  
- Designed for Tampermonkey / Greasemonkey style script managers.

## Installation

1. Install a userscript manager extension:
   - **Tampermonkey** (Chrome, Edge, Firefox, etc.)
   - **Violentmonkey**
   - **Greasemonkey** (Firefox)

2. Create a new userscript and paste in the contents of `yelp-my-photos.user.js`. [file:1]  
3. Save the script and ensure it is **enabled** for:
   - `https://www.yelp.ca/biz_photos/*`
   - `https://www.yelp.com/biz_photos/*` [file:1]

4. Visit any Yelp business photo page while logged in.  
   You should see a **“My Photos”** button next to **“Add Photos”**.

## How it works

- The script waits for Yelp’s photo page UI to render, then looks for the container that wraps the **“Add Photos”** button (a `div` with class similar to `y-css-1ilqd8r`). [file:1]  
- It clones the existing button so the new control matches Yelp’s styling, changes the text label to **“My Photos”**, and wires a click handler. [file:1]  
- On click, the script:
  - Extracts or reuses the current Yelp user ID.
  - Rebuilds the current `biz_photos` URL, setting `userid=<your-user-id>` in the query string. [file:1]  
  - Navigates the browser to this URL, which shows only your photos for that business. [file:1]

If the user ID cannot be detected (for example, if you are not logged in), the script will not inject the **“My Photos”** button.

## Usage

1. Open a Yelp business page and click **“See all photos”** (or navigate directly to `/biz_photos/<business>`). [file:1]  
2. Look for the **“My Photos”** button next to **“Add Photos”** at the top of the photo interface. [file:1]  
3. Click **“My Photos”** to jump to your own submitted photos for that business.

## Development notes

- The script is intentionally minimal and avoids any external dependencies.  
- Yelp’s CSS class names and DOM structure can change; if the button stops appearing, update the selectors that locate the **“Add Photos”** button wrapper. [file:1]  
- You can hard-code your user ID (e.g. `?userid=OrT26FPjwEjcZ-gCVOGwrw`) in the script if automatic detection becomes unreliable. [file:1]

## License

MIT License – feel free to modify, fork, and share.
