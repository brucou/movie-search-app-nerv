# Motivation
This repository showcases the use of state machines to modelize user interfaces. The chosen 
technologies are :
 is :
 - [hyperscript](https://github.com/brucou/nerv-hyperscript) for describing the screens of the interface in a portable way
 - [nervjs](https://github.com/NervJS/nerv) for rendering
 - [state-transducer](https://github.com/brucou/state-transducer) as state machine library
 - web components in order to have a reusable and portable implementation
 
Portability was important as the underlying idea is to port this application into many different
front-end frameworks. So far, implementation exists for :
  - [inferno](https://github.com/brucou/movie-search-app-inferno)

# Installation and execution
The application is built with parcel. To run it :

`npm install`

`npm run start`
