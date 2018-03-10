import React from 'react'
import AWS from 'aws-sdk'

AWS.config.region = 'us-west-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-west-2:3a222ba4-1c88-485d-aea8-ade0015fa33b',
});

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
