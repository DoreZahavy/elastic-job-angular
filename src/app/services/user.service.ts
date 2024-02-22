
import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, connectable, from, merge, Observable, Subject, throwError } from 'rxjs';
import { catchError, retry, tap, map, filter, take, switchMap, delay, startWith, debounceTime, distinctUntilChanged, share, multicast, concatMap, scan } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { storageService } from './async-storage.service';
import { User } from '../models/user.model';
import { UserApiService } from './user-api.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Errors } from '../models/errors';
import { Router } from '@angular/router';
const ENTITY = 'users'

@Injectable({
    providedIn: 'root'
})
export class UserService {

    userApiService = inject(UserApiService)
    router = inject(Router)

    // sources
    // private _filterBy$ = new BehaviorSubject<FilterBy>({ term: '' })
    private _removeUser$ = new Subject<string>()
    private _saveUser$ = new Subject<User>()

    // signals
    // filterBy_ = toSignal(this._filterBy$, { requireSync: true })
    users_ = signal<User[]>([])
    private errors_ = signal<Errors>({
        fetch: null,
        save: null,
        remove: null,
    })

    fetchError_ = computed(() => this.errors_().fetch)
    saveError_ = computed(() => this.errors_().save)
    removeError_ = computed(() => this.errors_().remove)

    // filteredUsers$ = this._filterBy$.pipe(
    //     debounceTime(500),
    //     distinctUntilChanged((prevFilter, currFilter) => prevFilter.term !== currFilter.term),
    //     switchMap(filterBy => this.userUserApiService.getUsers(filterBy)),
    //     catchError(err => this._handleError(err, 'fetch')),
    //     share()
    // )

    removedUserId$ = this._removeUser$.pipe(
        concatMap(userId => this.userApiService.removeUser(userId).pipe(map(() => userId))),
        catchError(err => this._handleError(err, 'remove')),
        share(),
    )

    savedUser$ = this._saveUser$.pipe(
        concatMap(user => this.userApiService.saveUser(user)),
        catchError(err => this._handleError(err, 'save')),
        share()
    )

    constructor(private http: HttpClient) {

        const users = JSON.parse(localStorage.getItem(ENTITY) || 'null');
        if (!users || users.length === 0) {
            localStorage.setItem(ENTITY, JSON.stringify(this._createUsers()))
        }

        // reducers
        // this.filteredUsers$.pipe(takeUntilDestroyed())
        //     .subscribe({
        //         next: (users) => {
        //             this.users_.set(users)
        //         },
        //         error: (err) => {
        //             console.log({ err })
        //         }
        //     })


        this.removedUserId$.pipe(takeUntilDestroyed())
            .subscribe({
                next: (userId) => {
                    this.users_.update(users => users.filter(user => user._id !== userId))
                },
                error: (err) => {
                    console.log({ err })
                }

            })

        this.savedUser$.pipe(takeUntilDestroyed())
            .subscribe({
                next: ({ user, isAdded }) => {
                    this.users_.update(users => {
                        return isAdded
                            ? [...users, user]
                            : users.map(p => p._id === user._id ? user : p);
                    })

                },
                error: (err) => {
                    console.log({ err })
                }

            })

    }



    // public getEmptyUser() {
    //     return { name: '', age: 0, birthDate: Date.now() }
    // }


    public remove(userId: string) {
        this._removeUser$.next(userId)
        return this.removedUserId$.pipe(take(1))
    }

    public save(user: User) {
        this._saveUser$.next(user)
        return this.savedUser$.pipe(take(1))
    }

    // public setFilterBy(filterBy: FilterBy) {
    //     this._filterBy$.next(filterBy)
    // }

    // public getById(userId: string): Observable<User> {
    //     return from(storageService.get<User>(ENTITY, userId))
    //         .pipe(
    //             retry(1),
    //             catchError((err) => this._handleError(err))
    //         )
    // }


    public cleanErrors(errorType?: keyof Errors) {
        this.errors_.update(errors => {
            if (errorType) return ({ ...errors, [errorType]: null })
            for (const key in errors) {
                errors[key] = null
            }
            return errors
        })
    }




    private _createUsers() {
        const users: User[] = [{"_id":"10","email":"hgurko0@opera.com","userName":"hgurko0","loc":{"lat":35.0475045,"lon":136.1219714},"skills":["Creative Non-fiction","Zumba","Yeast"],"experience":[{"startTime":1652469051000,"endTime":1659478908901,"company":"Youfeed","title":"Civil Engineer"},{"startTime":1354012627000,"endTime":1644979048334,"company":"Yata","title":"Geological Engineer"}],"fullName":"Hillyer Gurko","gender":"Male","imgUrl":"xsgames.co/randomusers/avatar.php?g=male"},
        {"_id":"1","email":"chulse1@home.pl","userName":"chulse1","loc":{"lat":-10.2313205,"lon":-67.2847875},"skills":["global HCM","OA Framework","Appeals","Ownership"],"experience":[{"startTime":1528339948000,"endTime":1529457056656,"company":"Photolist","title":"Occupational Therapist"},{"startTime":1545040293000,"endTime":1611264302522,"company":"Skimia","title":"Web Designer I"}],"fullName":"Chrystel Hulse","gender":"Female","imgUrl":"xsgames.co/randomusers/avatar.php?g=female"},
        {"_id":"2","email":"taloway2@nba.com","userName":"taloway2","loc":{"lat":19.3579802,"lon":-99.0806088},"skills":["Play by Play","RCCA","Financial Reporting","FF&amp;E Specifications"],"experience":[{"startTime":1328221399000,"endTime":1587101863226,"company":"Riffwire","title":"Marketing Assistant"},{"startTime":1537018617000,"endTime":1650877561421,"company":"Yodo","title":"Software Test Engineer I"},{"startTime":1345650357000,"endTime":1701077703221,"company":"Bubblebox","title":"Analyst Programmer"}],"fullName":"Tomas Aloway","gender":"Male","imgUrl":"xsgames.co/randomusers/avatar.php?g=male"},
        {"_id":"3","email":"bguesford3@imgur.com","userName":"bguesford3","loc":{"lat":-14.3386959,"lon":-72.8936384},"skills":["Gigabit Ethernet","HBOC","OmniPlan"],"experience":[{"startTime":1536400929000,"endTime":1591301802673,"company":"Zoombox","title":"Geological Engineer"}],"fullName":"Blair Guesford","gender":"Female","imgUrl":"xsgames.co/randomusers/avatar.php?g=female"},
        {"_id":"4","email":"wgosart4@domainmarket.com","userName":"wgosart4","loc":{"lat":9.0144214,"lon":-79.5125662},"skills":["CQT","Work Very Well with Others","Equity Trading"],"experience":[{"startTime":1664051480000,"endTime":1685862707500,"company":"Wikido","title":"Business Systems Development Analyst"},{"startTime":1540867782000,"endTime":1593010595135,"company":"Agimba","title":"Software Consultant"}],"fullName":"Wit Gosart","gender":"Male","imgUrl":"xsgames.co/randomusers/avatar.php?g=male"},
        {"_id":"5","email":"vshellum5@networkadvertising.org","userName":"vshellum5","loc":{"lat":14.5625862,"lon":121.0311185},"skills":["MPLAB","ICT"],"experience":[{"startTime":1654755376000,"endTime":1675509377107,"company":"Realmix","title":"Developer IV"}],"fullName":"Vail Shellum","gender":"Male","imgUrl":"xsgames.co/randomusers/avatar.php?g=male"},
        {"_id":"6","email":"fcobbe6@washington.edu","userName":"fcobbe6","loc":{"lat":53.3928271,"lon":18.3836801},"skills":["Events Organisation","PFEP","Human Computer Interaction","Jury Trials"],"experience":[{"startTime":1393791013000,"endTime":1597687781564,"company":"Jayo","title":"Structural Engineer"},{"startTime":1565839033000,"endTime":1700614158864,"company":"Edgeclub","title":"Dental Hygienist"}],"fullName":"Ferdy Cobbe","gender":"Male","imgUrl":"xsgames.co/randomusers/avatar.php?g=male"},
        {"_id":"7","email":"zmichal7@chronoengine.com","userName":"zmichal7","loc":{"lat":23.875208,"lon":112.542428},"skills":["QMF for Windows","Emergency Room"],"experience":[{"startTime":1475056269000,"endTime":1481821685874,"company":"Devify","title":"Associate Professor"}],"fullName":"Zora Michal","gender":"Female","imgUrl":"xsgames.co/randomusers/avatar.php?g=female"},
        {"_id":"8","email":"rdevenish8@psu.edu","userName":"rdevenish8","loc":{"lat":31.598726,"lon":120.301716},"skills":["Buyer Representation","Xbox","ADP HRB","Sqoop","Working at Height"],"experience":[{"startTime":1291137268000,"endTime":1295220492359,"company":"Zoonoodle","title":"Senior Sales Associate"}],"fullName":"Rogers Devenish","gender":"Male","imgUrl":"xsgames.co/randomusers/avatar.php?g=male"},
        {"_id":"9","email":"iwallen9@cornell.edu","userName":"iwallen9","loc":{"lat":2.9405941,"lon":9.9101915},"skills":["Interior Architecture","PLC","Fashion Photography","HBOC","IGP"],"experience":[{"startTime":1564396498000,"endTime":1651447437773,"company":"Yodel","title":"Editor"},{"startTime":1513021729000,"endTime":1561283870043,"company":"Lazz","title":"Senior Financial Analyst"},{"startTime":1615053168000,"endTime":1630747237225,"company":"Jaxworks","title":"Help Desk Technician"}],"fullName":"Ilene Wallen","gender":"Female","imgUrl":"xsgames.co/randomusers/avatar.php?g=female"}]
        return users
    }


    private _handleError(err: HttpErrorResponse | string, type?: keyof Errors) {
        console.log({ err, type })
        if (type) this.errors_.update(errors => {
            return ({ ...errors, [type]: this._isString(err) ? err : err.message });
        })
        return throwError(() => err)
    }


    private _isString(val: any): val is string {
        return typeof val === 'string' || val instanceof String;
    }


}


