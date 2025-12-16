# Yelp Biz – See My Photos Button

Adds a "See my photos" button to Yelp business pages, linking directly to your own uploaded photos for that business. Uses reliable user ID detection and stays visible even when Yelp re-renders the page.

## Features

- Adds a **"See my photos"** button to Yelp business pages (`/biz/...`) beside "See all ### photos"
- Automatically builds a link to `/biz_photos/{businessAlias}?userid={yourUserId}`
- Extracts your Yelp user ID using stable page internals:
  - From `window.OneTrust.dataSubjectParams.id` (`consumer-<id>` format)
  - From embedded JSON in `<script>` tags containing `userId` / `userIdEncid` / `userid`
- Uses DOM observation to keep the button visible if Yelp re-renders the header

## How it works

### 1. Business alias detection
The script parses `window.location.pathname` and extracts the alias from `/biz/golden-dragon-kitchen-san-francisco` → `golden-dragon-kitchen-san-francisco`.

### 2. User ID detection
The script attempts two proven methods, in order:
- Reads `window.OneTrust.dataSubjectParams.id` and strips the `consumer-` prefix
- Scans `<script>` tags for JSON containing `userId`, `userIdEncid`, or `userid` keys

### 3. Button injection
- Locates the "See all ### photos" link via an `href` that targets `/biz_photos/...`
- Clones the existing button's wrapper node to preserve Yelp's styling and layout
- Adjusts the cloned button's `href` to point at `/biz_photos/{alias}?userid={userId}` and changes the label to **"See my photos"**
- Inserts the new button **to the left** of the original "See all ### photos" button

### 4. Handling re-renders
- Runs once on page load when `document.readyState` is complete
- Attaches a `MutationObserver` on `document.body` to watch for DOM changes and re-inject the button if Yelp re-renders the header or photo section

## Installation

1. Install a userscript manager extension:
   - **Tampermonkey**, **Violentmonkey**, or a compatible alternative for your browser
2. Create a new userscript and paste the contents of the main script file (`yelp-biz-see-my-photos.user.js`)
3. Save the script and navigate to any Yelp business page.  
   e.g. https://www.yelp.com/biz/golden-dragon-kitchen-san-francisco  
You should now see a **"See my photos"** button to the left of **"See all ### photos"** in the photo header area.

## Limitations

- Only targets **business pages** (`/biz/...`), not standalone `biz_photos` pages
- Requires that you are **logged in** to Yelp and that your user ID is available either via OneTrust or script-embedded JSON. If no user ID can be found, the button will not be injected
- Tightly coupled to Yelp's current DOM and internal data structures; future Yelp UI changes may require updates to selectors or user ID extraction logic

## Development notes

- The script intentionally keeps logging minimal in the stable version, but the repository history may include a debug variant with exhaustive logging and method checks
- If Yelp changes how user IDs are exposed, additional detection methods can be added while preserving the same external behavior and button placement

## License

MIT
