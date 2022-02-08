# Better Products Backend

## Running The Backend

In Development Envirionment, Simply install all dependencies with

### `npm install`

Then start the app with

### `npm start`

The app will be exposed on port 80

This app will attempt to proxy all requests that it isn't prepared to handle to the frontend app which is expected to be listening on port 3000 hence the app can be accessed via[Naijadevs](http://naijadevs.xyz/)

The Case is different for production as this app will present a production build which will render the copied automatically build code for production via a git deployment hook to the react_build directory in this project, So

## Live Presentation

A live version will be available on [Alivirtual](https://alivirtual.com).
