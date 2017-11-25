import React from 'react'



function FacebookLogin({onlogin}) {
    
    window.__facebook_login__ = function() {
	onlogin()
    }
    try {
	(function(d, s, id){
	    var js, fjs = d.getElementsByTagName(s)[0];
	    if (d.getElementById(id)) {return;}
	    js = d.createElement(s); js.id = id;
	    js.src = "https://connect.facebook.net/en_US/sdk.js";
	    fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
    }
    catch(e) {
    }

    return (<div className="fb-login-button" data-max-rows="1" data-size="large" data-button-type="continue_with"  data-show-faces="false" data-auto-logout-link="true" data-use-continue-as="false"></div>)
}

export default FacebookLogin;
