# Frontend

This is the Angular web-based frontend application used to define site layouts in the project. It communicates with the backend server.

It is set to communicate with the Azure-hosted backend. However, this can be changed to work with the local backend server at "https://localhost:7081/".

This can be changed in the file Frontend/src/app/services/globals.ts, line 12.

This is not necessary if https://fypwebapi20230207105914.azurewebsites.net/ still exists.

# Installation

Node.js is required to run the server. Download here: 

https://nodejs.org/en/download

From main directory, run:

`npm install -g @angular/cli`

`npm install -g`

This will download the necessary packages to run the server.

# Running server
Once installed, run `ng serve` to run a server. Navigate to `http://localhost:4200/` to view the webpage.
