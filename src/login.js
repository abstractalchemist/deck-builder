import React from 'react'



function FacebookLogin({onlogin}) {
    
    window.__facebook_login__ = function() {
	onlogin()
    }
    return (<div className="fb-login-button" data-max-rows="1" data-size="large" data-button-type="continue_with"  data-show-faces="false" data-auto-logout-link="true" data-use-continue-as="false"></div>)
}

export default FacebookLogin;
