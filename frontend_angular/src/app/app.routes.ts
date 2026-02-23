import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { 
        path: '', 
        loadComponent: () => import('./features/home/landing-page/landing-page').then(m => m.LandingPage) 
    },
    { 
        path: 'articulos', 
        loadComponent: () => import('./features/articles/article-list/article-list').then(m => m.ArticleList) 
    },
    { 
        path: 'articulos/:id', 
        loadComponent: () => import('./features/articles/article-detail/article-detail').then(m => m.ArticleDetail) 
    },
    { 
        path: 'login', 
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login) 
    },
    { 
        path: 'register', 
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register) 
    },
    { 
        path: 'dashboard', 
        canActivate: [authGuard],
        children: [
            { 
                path: '', 
                loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard) 
            },
            { 
                path: 'crear-articulo', 
                loadComponent: () => import('./features/articles/create-article/create-article').then(m => m.CreateArticle) 
            },
            { 
                path: 'editar-articulo/:id', 
                loadComponent: () => import('./features/articles/edit-article/edit-article').then(m => m.EditArticle) 
            },
            { 
                path: 'redactor-dashboard', 
                loadComponent: () => import('./features/dashboard/redactor-dashboard/redactor-dashboard').then(m => m.RedactorDashboard) 
            },
            { 
                path: 'editor-dashboard', 
                loadComponent: () => import('./features/dashboard/editor-dashboard/editor-dashboard').then(m => m.EditorDashboard) 
            },
            { 
                path: 'admin-dashboard', 
                loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) 
            }
        ]
    }
];
