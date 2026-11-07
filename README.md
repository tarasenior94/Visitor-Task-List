# Visitors Prep

Family checklist for getting the house ready for visitors, installable on Android and iPhone.

## Put it on GitHub Pages

1. Create a new repository on github.com (for example `visitors-prep`).
2. Click **Add file → Upload files** and drag in everything from this folder,
   including the `icons` folder and the `.nojekyll` file. Click **Commit changes**.
3. Go to **Settings → Pages**. Under **Branch**, choose `main` and `/ (root)`, then **Save**.
4. After a minute or two the address appears at the top of that page,
   e.g. `https://yourname.github.io/visitors-prep/`.

## Install on a phone

- **iPhone:** open the link in **Safari**, tap **Share**, then **Add to Home Screen**.
- **Android:** open the link in **Chrome**, tap **⋮**, then **Install app** (or **Add to Home screen**).

## Sharing the list with the family

Until `config.js` has your Supabase details, the app is in preview mode and each phone keeps its own ticks.
Add the Supabase Project URL and publishable key to `config.js` to share one list between everyone.

## Updating the app later

After uploading changed files, open `sw.js` and change `visitors-prep-v1` to `visitors-prep-v2` (and so on).
That tells phones to fetch the new version.
