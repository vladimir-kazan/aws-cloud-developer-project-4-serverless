import auth0 from 'auth0-js';
import { authConfig } from '../config';

export default class Auth {
  accessToken;
  idToken;
  expiresAt;

  auth0 = new auth0.WebAuth({
    domain: authConfig.domain,
    clientID: authConfig.clientId,
    redirectUri: authConfig.callbackUrl,
    responseType: 'token id_token',
    scope: 'openid'
  });

  constructor(history) {
    this.history = history

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    this.renewSession = this.renewSession.bind(this);
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        console.log('Access token: ', authResult.accessToken)
        console.log('id token: ', authResult.idToken)
        this.setSession(authResult);
      } else if (err) {
        this.history.replace('/');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

  getIdToken() {
    this.idToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InlYZFp2S21PY2tWZkwzLVlMNG8tWiJ9.eyJpc3MiOiJodHRwczovL3ZrdTcxMy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDc4NDIwNTk1MjgyNjUwMjQ5ODEiLCJhdWQiOiJqOW9ySHltYWdTMjlzbjY1QTVqMnhaczhKeVNTNHVwYyIsImlhdCI6MTU4NjE5NjI1NSwiZXhwIjoxNTg2MjMyMjU1LCJhdF9oYXNoIjoiRU1iUWFjcW9zc21aNzZxZnFORm1iZyIsIm5vbmNlIjoiQm9CYTRzOE1TRmNqNVRxU0plWDdHSVBmZFotVnJRS0cifQ.GHuxspH6lwQQIssBnt7Z2MpCxOJmcvX-12sKTaIfX6Sg94s6HAIz61fG5brrY0OGe83Nku2QtkMUdnqfiWgTVvVOSC_3uBwKt70tfWgU8IVfzEDM5fpB3OTbVYIdRCKQi4zr98XDlYmqUuejotdGwcBNSjHqBzYwwwWOEw0MM8OgHOT89GIqPjQ83CfPTJgISmLnFHnB8cA07DpPXWgMuiZwN9OzqjvMO_Jw5bhfynTkckuF3lNvC9fwaV24jA3BaJkgTvjehzJKIQ7OklWh7fjiqSl7Li2ZHp7zYQOHAn7CIDcg04Mdytea1Ab0ROQTn4I0SySWP9qEcCNtpaZfbA';
    return this.idToken;
  }

  setSession(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');

    // Set the time that the access token will expire at
    let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = expiresAt;

    // navigate to the home route
    this.history.replace('/');
  }

  renewSession() {
    this.auth0.checkSession({}, (err, authResult) => {
       if (authResult && authResult.accessToken && authResult.idToken) {
         this.setSession(authResult);
       } else if (err) {
         this.logout();
         console.log(err);
         alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
       }
    });
  }

  logout() {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');

    this.auth0.logout({
      return_to: window.location.origin
    });

    // navigate to the home route
    this.history.replace('/');
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    // let expiresAt = this.expiresAt;
    // return new Date().getTime() < expiresAt;
    return true;
  }
}
