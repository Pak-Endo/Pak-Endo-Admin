# Mohid's Angular-Custom-Boilerplate

| Angular | Compodoc | Tailwind CSS |
| ------------ | ------------- | ------------- |
| <img src="https://angular.io/assets/images/logos/angular/angular.svg" width="100" height="100"> | ![Compodoc logo](https://compodoc.app/assets/img/logo.png) | <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/1200px-Tailwind_CSS_Logo.svg.png" width="100" height="100">

## Features

- Uses the latest stable ***Angular*** releases (currently using version ***15.2.1***)
- Fully configured as a ***PWA (Progressive Web App)***, with service workers, web manifest and icons etc.
- Fully configured to use ***[Tailwind CSS](https://tailwindcss.com/)*** for all styling and designing. Includes many pre-defined custom classes in the tailwind config file
- Configured with ***[Compodoc](https://compodoc.app/)*** to handle the documentation of the entire project (components, services, injectables etc.)
- Comes pre built with custom ***Auth Service***, ***JWT Interceptor***, ***Server Error Interceptor*** for handling authentication
- Custom Utility file for handling Local Storage manipulation
- A core Factory Service for handling APIs. Fully customised to handle api response and errors without the need to use `try-catch` or `catchError` repeatedly. Generic methods to handle all REST API methods as well as handling payloads, query parameters etc. For more see the file `api.service.ts`
- Comes with pre made ***Auth Guard*** for handling route access and protection based on user's authorization.

## Usage Notes:

Download or clone the repo. In the command line or terminal run `npm install` to install dependencies and that's it. You are ready to go!

To generate documentation:
   - Use command `npm run compodoc:build` to generate the documentation build.
   - Use command `npm run compodoc:serve` to view the documentation at `http://127.0.0.1:8080`

