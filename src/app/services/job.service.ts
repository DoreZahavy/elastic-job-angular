import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, connectable, from, merge, Observable, Subject, throwError } from 'rxjs';
import { catchError, retry, tap, map, filter, take, switchMap, delay, startWith, debounceTime, distinctUntilChanged, share, multicast, concatMap, scan } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { storageService } from './async-storage.service';
import { Job } from '../models/job.model';
import { JobApiService } from './job-api.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Errors } from '../models/errors';
import { Router } from '@angular/router';
const ENTITY = 'jobs'

@Injectable({
    providedIn: 'root'
})
export class JobService {

    jobApiService = inject(JobApiService)
    router = inject(Router)

    // sources
    // private _filterBy$ = new BehaviorSubject<FilterBy>({ term: '' })
    private _removeJob$ = new Subject<string>()
    private _saveJob$ = new Subject<Job>()

    // signals
    // filterBy_ = toSignal(this._filterBy$, { requireSync: true })
    jobs_ = signal<Job[]>([])
    private errors_ = signal<Errors>({
        fetch: null,
        save: null,
        remove: null,
    })

    fetchError_ = computed(() => this.errors_().fetch)
    saveError_ = computed(() => this.errors_().save)
    removeError_ = computed(() => this.errors_().remove)

    // filteredJobs$ = this._filterBy$.pipe(
    //     debounceTime(500),
    //     distinctUntilChanged((prevFilter, currFilter) => prevFilter.term !== currFilter.term),
    //     switchMap(filterBy => this.jobApiService.getJobs(filterBy)),
    //     catchError(err => this._handleError(err, 'fetch')),
    //     share()
    // )

    removedJobId$ = this._removeJob$.pipe(
        concatMap(jobId => this.jobApiService.removeJob(jobId).pipe(map(() => jobId))),
        catchError(err => this._handleError(err, 'remove')),
        share(),
    )

    savedJob$ = this._saveJob$.pipe(
        concatMap(job => this.jobApiService.saveJob(job)),
        catchError(err => this._handleError(err, 'save')),
        share()
    )

    constructor(private http: HttpClient) {

        const jobs = JSON.parse(localStorage.getItem(ENTITY) || 'null');
        if (!jobs || jobs.length === 0) {
            localStorage.setItem(ENTITY, JSON.stringify(this._createJobs()))
        }

        // reducers
        // this.filteredJobs$.pipe(takeUntilDestroyed())
        //     .subscribe({
        //         next: (jobs) => {
        //             this.jobs_.set(jobs)
        //         },
        //         error: (err) => {
        //             console.log({ err })
        //         }
        //     })


        this.removedJobId$.pipe(takeUntilDestroyed())
            .subscribe({
                next: (jobId) => {
                    this.jobs_.update(jobs => jobs.filter(job => job._id !== jobId))
                },
                error: (err) => {
                    console.log({ err })
                }

            })

        this.savedJob$.pipe(takeUntilDestroyed())
            .subscribe({
                next: ({ job, isAdded }) => {
                    this.jobs_.update(jobs => {
                        return isAdded
                            ? [...jobs, job]
                            : jobs.map(p => p._id === job._id ? job : p);
                    })

                },
                error: (err) => {
                    console.log({ err })
                }

            })

    }



    // public getEmptyJob() {
    //     return { name: '', age: 0, birthDate: Date.now() }
    // }


    public remove(jobId: string) {
        this._removeJob$.next(jobId)
        return this.removedJobId$.pipe(take(1))
    }

    public save(job: Job) {
        this._saveJob$.next(job)
        return this.savedJob$.pipe(take(1))
    }

    // public setFilterBy(filterBy: FilterBy) {
    //     this._filterBy$.next(filterBy)
    // }

    // public getById(jobId: string): Observable<Job> {
    //     return from(storageService.get<Job>(ENTITY, jobId))
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




    private _createJobs() {
        const jobs: Job[] = [{"_id":"1","company":"Photobug","title":"Research Assistant III","loc":{"lat":35.632522,"lon":138.9562642},"skillsRequired":["SLES","Hyper-V","IVD","PL/SQL","XUL"],"type":"Part-time","datePosted":1698000899000,"place":"Hybrid"},
        {"_id":"2","company":"Jaxworks","title":"Director of Sales","loc":{"lat":23.63841,"lon":115.182134},"skillsRequired":["Nonprofits","Xactimate","Urban Studies","RSA SecurID","Nielsen Data"],"type":"Part-time","datePosted":1662933273000,"place":"Hybrid"},
        {"_id":"3","company":"Kanoodle","title":"Analog Circuit Design manager","loc":{"lat":30.641073,"lon":118.315476},"skillsRequired":["Short Sales","Freight Forwarding","TPD"],"type":"Part-time","datePosted":1652741927000,"place":"On-site"},
        {"_id":"4","company":"Jamia","title":"Librarian","loc":{"lat":20.5511364,"lon":-103.461601},"skillsRequired":["Hatha Yoga","Staff Development","OC RDC","Mental Health"],"type":"Full-time","datePosted":1705459563000,"place":"On-site"},
        {"_id":"5","company":"Flipstorm","title":"Legal Assistant","loc":{"lat":50.7837134,"lon":17.0744196},"skillsRequired":["LaTeX","RS Means","MLA Style","UCINET","uCOS","Private Piloting"],"type":"Full-time","datePosted":1651293455000,"place":"Hybrid"},
        {"_id":"6","company":"Skimia","title":"Community Outreach Specialist","loc":{"lat":48.403405,"lon":7.456782},"skillsRequired":["HMIs","Rational DOORS","RSoft","ILOG"],"type":"Part-time","datePosted":1674608292000,"place":"Remote"},
        {"_id":"7","company":"Fivespan","title":"Accountant I","loc":{"lat":41.8036152,"lon":20.9182981},"skillsRequired":["Gynecologic Oncology","Citrix","LDPC","Egyptian Arabic","Kickstart"],"type":"Part-time","datePosted":1677681170000,"place":"Hybrid"},
        {"_id":"8","company":"Feedbug","title":"GIS Technical Architect","loc":{"lat":-14.3377247,"lon":-170.7810162},"skillsRequired":["MLP","FMCG","BDC","Award Winner","Reality TV","Sustainable Development"],"type":"Full-time","datePosted":1681227056000,"place":"Remote"},
        {"_id":"9","company":"Roomm","title":"Help Desk Operator","loc":{"lat":25.6564843,"lon":-100.3694401},"skillsRequired":["Hlookups","Tissue Culture","Berkeley DB","Pyxis"],"type":"Part-time","datePosted":1704328625000,"place":"Remote"},
        {"_id":"10","company":"Quaxo","title":"Business Systems Development Analyst","loc":{"lat":38.0970415,"lon":21.4183073},"skillsRequired":["NDE","Technical Documentation","XPAC","MyBatis","Field Work","HRO"],"type":"Full-time","datePosted":1649773474000,"place":"Hybrid"}];
        return jobs
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


