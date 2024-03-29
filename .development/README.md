# Astro with Tailwind

This project was created with
```sh
npm create astro@latest -- --template with-tailwindcss
```
To build this project run 
```sh
npm run build
```
Building will move static pages from .development/dist/ to ./ 
This is because the ci/cd pipeline deploys directly to public_html
on our production server, which means index.html and other pages need 
to be found at the root of this project instead of in /dist/ or any other subfolders


To run a hot reloading development server run 
```sh
npm run dev
```
and modify files in .development/src/
