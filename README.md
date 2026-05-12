# Race Build Arena

A browser-based racing and customization game for car enthusiasts.

## How to play
- Open `index.html` in your browser.
- Use `A/D` or `←/→` to steer.
- Use `W/S` or `↑/↓` for small position adjustments.
- Hold `Shift` to use Nitro.
- Press `P` to pause the race.

## Features
- Urban race track with obstacle dodging
- Custom car build preview with paint, wheels, spoilers
- Performance upgrades: engine, tires, brakes, nitro
- Free credits and premium coins reward system
- Premium Pro Suite for exclusive visual builds
- Persistent garage progress and high score

## Files
- `index.html` — game page layout and UI
- `styles.css` — styling for race interface and garage
- `script.js` — racing logic, obstacles, upgrades, and save data

## Publish to GitHub Pages
1. Install Git if not already installed.
2. Create a new GitHub repository and connect it to this folder.
3. Run:
   - `git init`
   - `git add .`
   - `git commit -m "Initial game release"`
   - `git branch -M main`
   - `git remote add origin https://github.com/<your-username>/<your-repo>.git`
   - `git push -u origin main`
4. The workflow in `.github/workflows/pages.yml` will deploy the site automatically to the `gh-pages` branch.
5. Your page will be available at `https://<your-username>.github.io/<your-repo>/` once deployment completes.
