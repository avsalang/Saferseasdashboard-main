
  # SAFERSEAS Dashboard Wireframe

  This is a code bundle for SAFERSEAS Dashboard Wireframe. The original project is available at https://www.figma.com/design/C6GVddVNy9M48AVQ11seJs/SAFERSEAS-Dashboard-Wireframe.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
  ## Sharing On GitHub Pages

  This project is configured to work on GitHub Pages using hash-based routes, so direct links to pages like `#/dashboard` or `#/gis-map` will not 404.

  1. Run `npm install --legacy-peer-deps`
  2. Run `npm run build`
  3. Upload the contents of the generated `dist` folder to GitHub Pages

  If you publish from a GitHub repository:

  1. Push this project to GitHub
  2. In the repository settings, open `Pages`
  3. Set `Source` to `GitHub Actions`
  4. Push to `main` and wait for the `Deploy To GitHub Pages` workflow to finish
  5. Share the published URL with your peers

  The landing page will open at the site root, and internal screens will use URLs like `#/dashboard`.
  
