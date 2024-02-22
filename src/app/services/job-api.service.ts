

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { from, map, retry } from 'rxjs';
import { storageService } from './async-storage.service';
import { Job } from '../models/job.model';
const JOB_KEY = 'jobDB'
@Injectable({
  providedIn: 'root'
})
export class JobApiService {
  // http = inject(HttpClient)
  // httpsa = inject(HttpClient)
  constructor() { }

  getJobs() {
    return from(storageService.query<Job>(JOB_KEY)).pipe(
      // map(jobs => this._filterJobs(jobs, filterBy)),
      retry(1)
    )
  }

  getJob(jobId: string) {
    return from(storageService.get<Job>(JOB_KEY, jobId)).pipe(retry(1))
  }

  removeJob(jobId: string) {
    return from(storageService.remove<Job>(JOB_KEY, jobId)).pipe(retry(1))
  }

  addJob(job: Job) {
    return from(storageService.post<Job>(JOB_KEY, job)).pipe(retry(1))
  }

  updateJob(job: Job) {
    return from(storageService.put<Job>(JOB_KEY, job)).pipe(retry(1))
  }

  saveJob(job: Job) {
    return (job._id ? this.updateJob(job) : this.addJob(job))
      .pipe(map(savedJob => ({ job: savedJob, isAdded: !job._id })), retry(1))
  }
}