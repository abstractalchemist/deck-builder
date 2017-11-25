import React from 'react';
import ReactDOM from 'react-dom';
import Main from './main';

console.log('adding loaded handler')
document.addEventListener('DOMContentLoaded', function() {
    ReactDOM.render( <Main />, document.querySelector('#content'));
})

console.log('adding init handler')
window.addEventListener('fbinit', function() {
    console.log('fbinit called')
    ReactDOM.render( <Main />, document.querySelector('#content'));
    window.__facebook_login__()
}, false)
