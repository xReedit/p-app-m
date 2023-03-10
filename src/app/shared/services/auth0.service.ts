import { Injectable } from '@angular/core';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { from, of, Observable, BehaviorSubject, combineLatest, throwError } from 'rxjs';
import { tap, catchError, concatMap, shareReplay, delay, switchMap, share } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth0Service {
  // Create an observable of Auth0 instance of client
  auth0Client$ = (from(
    createAuth0Client({
      domain: 'dev-m48s1pe2.auth0.com',
      client_id: 'kSs64dcx34Fo7HpDLYkE3gQH0v2MtcdR',
      redirect_uri: `${window.location.origin}/callback-auth`
    })
  ) as Observable<Auth0Client>).pipe(
    share(), // Every subscription receives the same shared value
    catchError(err => throwError(err))
  );
  // Define observables for SDK methods that return promises by default
  // For each Auth0 SDK method, first ensure the client instance is ready
  // concatMap: Using the client instance, call SDK method; SDK returns a promise
  // from: Convert that resulting promise into an observable

  // isAuthenticated$ = this.auth0Client$.pipe(
  //   concatMap((client: Auth0Client) => from(client.isAuthenticated())),
  //   tap(res => this.loggedIn = res)
  // );

  private urlFromAuth: string;
  // Create a local property for login status
  loggedIn: boolean = null;

  // handleRedirectCallback$ = this.auth0Client$.pipe(
  //   concatMap((client: Auth0Client) => from(client.handleRedirectCallback()))
  // );

  handleRedirectCallback$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.handleRedirectCallback(this.urlFromAuth)))
  );

  isAuthenticated$ = this.auth0Client$.pipe(
    delay(500), // add delay to pipe
    switchMap((client: Auth0Client) => from(client.isAuthenticated())),
    tap(res => this.loggedIn = res)
  );

  // Create subject and public observable of user profile data
  private userProfileSubject$ = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject$.asObservable();

  // 01022022 avisar al callback-auth
  userProfileChangeSubject$ = new BehaviorSubject<any>(null);
  userProfileChange$ = this.userProfileChangeSubject$.asObservable();


  constructor(private router: Router) {
    // On initial load, check authentication state with authorization server
    // Set up local auth streams if user is already authenticated
    this.localAuthSetup();
    // Handle redirect from Auth0 login
    this.handleAuthCallback();
  }

  // When calling, options can be passed if desired
  // https://auth0.github.io/auth0-spa-js/classes/auth0client.html#getuser
  getUser$(options?): Observable<any> {
    // console.log('change userProfileSubject');
    return this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.getUser(options))),
      tap(user => this.userProfileSubject$.next(user))
    );
  }

  private localAuthSetup() {
    // This should only be called on app initialization
    // Set up local authentication streams
    const checkAuth$ = this.isAuthenticated$.pipe(
      concatMap((loggedIn: boolean) => {
        if (loggedIn) {
          // If authenticated, get user and set in app
          // NOTE: you could pass options here if needed
          return this.getUser$();
        }
        // If not authenticated, return stream that emits 'false'
        return of(loggedIn);
      })
    );
    checkAuth$.subscribe();
  }

  login(redirectPath: string = '/', proveedor: string) {
    // A desired redirect path can be passed to login method
    // (e.g., from a route guard)
    // Ensure Auth0 client instance exists
    console.log('redirectPath auth0', redirectPath);
    this.auth0Client$.subscribe((client: Auth0Client) => {
      // Call method to log in
      client.loginWithRedirect({
        connection: proveedor,
        redirect_uri: `${window.location.origin}/callback-auth`,
        appState: { target: redirectPath }
      });
    });
  }

  private handleAuthCallback() {
    // Call when app reloads after user logs in with Auth0
    this.urlFromAuth = window.location.href;
    const params = window.location.search;
    if (params.includes('code=') && params.includes('state=')) {
      let targetRoute: string; // Path to redirect to after login processsed
      const authComplete$ = this.handleRedirectCallback$.pipe(
        // Have client, now call method to handle auth callback redirect
        tap(cbRes => {
          // Get and set target redirect route from callback results
          targetRoute = cbRes.appState && cbRes.appState.target ? cbRes.appState.target : '/';
        }),
        concatMap(() => {
          // Redirect callback complete; get user and login status
          return combineLatest([
            this.getUser$(),
            this.isAuthenticated$
          ]);
        })
      );
      // Subscribe to authentication completion observable
      // Response will be an array of user and login status
      authComplete$.subscribe(([user, loggedIn]) => {
        // Redirect to target route after callback processing
        // console.log('targetRoute', targetRoute);
        this.router.navigate([targetRoute]);
      });
    }
  }

  logout() {
    // Ensure Auth0 client instance exists
    this.auth0Client$.subscribe((client: Auth0Client) => {
      // Call method to log out
      client.logout({
        client_id: 'kSs64dcx34Fo7HpDLYkE3gQH0v2MtcdR',
        returnTo: `${window.location.origin}`
      });
    });
  }

}
