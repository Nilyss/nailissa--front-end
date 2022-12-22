import { Component, OnInit, OnDestroy } from '@angular/core'
import { catchError, of, Subscription, switchMap, tap } from 'rxjs'

// External Libs
import AOS from 'aos'
import disableScroll from 'disable-scroll'

// NGRX
import { Store } from '@ngrx/store'
import * as UserActions from '../data/NgRx/controller/user/userAction'
import * as ProvisionActions from '../data/NgRx/controller/provision/provisionAction'
// MODELS
import { User } from '../data/NgRx/models/user'
import { Provision } from '../data/NgRx/models/provision'
import { UserState } from '../data/NgRx/controller/user/userReducer'
import { ProvisionState } from '../data/NgRx/controller/provision/provisionReducer'
// SERVICES
import { UserService } from '../data/services/user.service'
import { ProvisionService } from '../data/services/provision.service'

@Component({
  selector: 'app-home',
  template: `
    <body class="body">
      <app-home-loader></app-home-loader>
      <header>
        <app-home-header></app-home-header>
      </header>
      <main>
        <section>
          <app-home-banner></app-home-banner>
        </section>
        <section>
          <app-home-first-article></app-home-first-article>
          <app-home-second-article></app-home-second-article>
        </section>
        <section>
          <app-home-link-cards></app-home-link-cards>
        </section>
        <section>
          <app-home-newsletter></app-home-newsletter>
          <app-home-contact></app-home-contact>
        </section>
      </main>
      <footer>
        <app-home-footer></app-home-footer>
      </footer>
      <app-back-to-top></app-back-to-top>
    </body>
  `,
  styleUrls: ['home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // ********** VARIABLES **********

  subscription: Subscription | undefined

  // ********** ON INIT FUNCTIONS **********

  disableScrollWhileLoader() {
    disableScroll.on()
    setTimeout(enable, 3000)
    function enable() {
      disableScroll.off()
    }
  }

  initPackageAOS() {
    AOS.init({
      disable: 'mobile',
    })
    AOS.refreshHard()
    AOS.refresh()
  }

  getProvisionFromDb() {
    this.subscription = this.provisionService
      .getAllProvision()
      .pipe(
        tap((provisions: Provision[]) =>
          this.store.dispatch(ProvisionActions.getProvisionData({ provisions }))
        ),
        catchError((error) => this.handleError(error, undefined))
      )
      .subscribe()
  }

  getConnectedUserData() {
    this.subscription = this.userService
      .getConnectedUserId()
      .pipe(
        switchMap((userId: User['_id']) =>
          this.userService.getConnectedUserData(userId)
        ),
        tap((user: Omit<User, 'password'>) => {
          this.store.dispatch(
            UserActions.getUserData({
              user,
              isHomePageVisited: true,
            })
          )
        }),
        catchError((error) => this.handleError(error, undefined))
      )
      .subscribe()
  }

  // ********** HANDLE ERRORS **********

  private handleError(error: Error, errorValue: any) {
    console.error(error)
    return of(errorValue)
  }

  constructor(
    private store: Store<{ user: UserState; provision: ProvisionState }>,
    private userService: UserService,
    private provisionService: ProvisionService
  ) {}
  ngOnInit() {
    this.initPackageAOS()
    this.disableScrollWhileLoader()
    this.getProvisionFromDb()
    this.getConnectedUserData()
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }
}
