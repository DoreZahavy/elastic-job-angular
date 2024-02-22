

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { from, map, retry } from 'rxjs';
import { storageService } from './async-storage.service';
import { User } from '../models/user.model';
const USER_KEY = 'userDB'
@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  // http = inject(HttpClient)
  // httpsa = inject(HttpClient)
  constructor() { }

  getUsers() {
    return from(storageService.query<User>(USER_KEY)).pipe(
      // map(users => this._filterUsers(users, filterBy)),
      retry(1)
    )
  }

  getUser(userId: string) {
    return from(storageService.get<User>(USER_KEY, userId)).pipe(retry(1))
  }

  removeUser(userId: string) {
    return from(storageService.remove<User>(USER_KEY, userId)).pipe(retry(1))
  }

  addUser(user: User) {
    return from(storageService.post<User>(USER_KEY, user)).pipe(retry(1))
  }

  updateUser(user: User) {
    return from(storageService.put<User>(USER_KEY, user)).pipe(retry(1))
  }

  saveUser(user: User) {
    return (user._id ? this.updateUser(user) : this.addUser(user))
      .pipe(map(savedUser => ({ user: savedUser, isAdded: !user._id })), retry(1))
  }
}