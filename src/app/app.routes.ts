import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { SigninPageComponent } from './pages/signin-page/signin-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { JobIndexComponent } from './pages/job-index/job-index.component';
import { UserIndexComponent } from './pages/user-index/user-index.component';

export const routes: Routes = [
    { path: 'signin', component: SigninPageComponent },
   
  
    {
        path: 'jobs',
        component: JobIndexComponent,
        canActivate: [authGuard],
        // resolve: { pet: petResolver }
    },
    {
        path: 'users',
        component: UserIndexComponent,
        canActivate: [authGuard],
    },
  
    {
        path: '',
        component: HomePageComponent,
    },
    { path: '**', redirectTo: '/' } 
];
