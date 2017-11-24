import React from 'react';
import ReactDOM from 'react-dom';
import Main from './main';

document.addEventListener('DOMContentLoaded', function() {
    ReactDOM.render( <Main />, document.querySelector('#content'));
})

document.addEventListener('fbinit', function() {
    console.log('fbinit called')
    ReactDOM.render( <Main />, document.querySelector('#content'));
}, false)
