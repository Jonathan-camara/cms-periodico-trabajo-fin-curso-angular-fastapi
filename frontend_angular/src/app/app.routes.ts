import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './auth/auth-guard';
import { CreateArticle } from './components/create-article/create-article';
import { ArticleList } from './article-list/article-list';
import { ArticleDetail } from './pages/article-detail/article-detail';
import { EditArticle } from './pages/edit-article/edit-article';
import { RedactorDashboard } from './pages/redactor-dashboard/redactor-dashboard';
import { EditorDashboard } from './pages/editor-dashboard/editor-dashboard';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

export const routes: Routes = [
    { path: '', component: LandingPage },
    { path: 'articulos', component: ArticleList },
    { path: 'articulos/:id', component: ArticleDetail },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'dashboard/crear-articulo', component: CreateArticle, canActivate: [authGuard] },
    { path: 'dashboard/editar-articulo/:id', component: EditArticle, canActivate: [authGuard] },
    { path: 'dashboard/redactor-dashboard', component: RedactorDashboard, canActivate: [authGuard] },
    { path: 'dashboard/editor-dashboard', component: EditorDashboard, canActivate: [authGuard] },
    { path: 'dashboard/admin-dashboard', component: AdminDashboard, canActivate: [authGuard] }
];
