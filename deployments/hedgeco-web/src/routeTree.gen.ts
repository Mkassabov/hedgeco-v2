/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LogoutImport } from './routes/logout'
import { Route as AdminLogoutImport } from './routes/admin-logout'
import { Route as PublicImport } from './routes/_public'
import { Route as AuthedAdminImport } from './routes/_authed-admin'
import { Route as PublicIndexImport } from './routes/_public/index'
import { Route as PublicContactUsImport } from './routes/_public/contact-us'
import { Route as PublicAboutUsImport } from './routes/_public/about-us'
import { Route as PublicNewsRouteImport } from './routes/_public/news/route'
import { Route as PublicNewsIndexImport } from './routes/_public/news/index'
import { Route as AuthedAdminAdminIndexImport } from './routes/_authed-admin/admin/index'
import { Route as PublicRegisterServiceProviderImport } from './routes/_public/register/service-provider'
import { Route as PublicRegisterNewsMemberImport } from './routes/_public/register/news-member'
import { Route as PublicRegisterInvestorcopyImport } from './routes/_public/register/investor copy'
import { Route as PublicRegisterInvestorImport } from './routes/_public/register/investor'
import { Route as PublicNewsArticleIdImport } from './routes/_public/news/$articleId'
import { Route as AuthedAdminAdminArticlesRouteImport } from './routes/_authed-admin/admin/articles/route'
import { Route as AuthedAdminAdminArticlesIndexImport } from './routes/_authed-admin/admin/articles/index'
import { Route as PublicLegalDocLegalDocumentNameImport } from './routes/_public/legal/doc.$legalDocumentName'
import { Route as AuthedAdminAdminArticlesNewImport } from './routes/_authed-admin/admin/articles/new'
import { Route as AuthedAdminAdminArticlesArticleIdImport } from './routes/_authed-admin/admin/articles/$articleId'

// Create/Update Routes

const LogoutRoute = LogoutImport.update({
  id: '/logout',
  path: '/logout',
  getParentRoute: () => rootRoute,
} as any)

const AdminLogoutRoute = AdminLogoutImport.update({
  id: '/admin-logout',
  path: '/admin-logout',
  getParentRoute: () => rootRoute,
} as any)

const PublicRoute = PublicImport.update({
  id: '/_public',
  getParentRoute: () => rootRoute,
} as any)

const AuthedAdminRoute = AuthedAdminImport.update({
  id: '/_authed-admin',
  getParentRoute: () => rootRoute,
} as any)

const PublicIndexRoute = PublicIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => PublicRoute,
} as any)

const PublicContactUsRoute = PublicContactUsImport.update({
  id: '/contact-us',
  path: '/contact-us',
  getParentRoute: () => PublicRoute,
} as any)

const PublicAboutUsRoute = PublicAboutUsImport.update({
  id: '/about-us',
  path: '/about-us',
  getParentRoute: () => PublicRoute,
} as any)

const PublicNewsRouteRoute = PublicNewsRouteImport.update({
  id: '/news',
  path: '/news',
  getParentRoute: () => PublicRoute,
} as any)

const PublicNewsIndexRoute = PublicNewsIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => PublicNewsRouteRoute,
} as any)

const AuthedAdminAdminIndexRoute = AuthedAdminAdminIndexImport.update({
  id: '/admin/',
  path: '/admin/',
  getParentRoute: () => AuthedAdminRoute,
} as any)

const PublicRegisterServiceProviderRoute =
  PublicRegisterServiceProviderImport.update({
    id: '/register/service-provider',
    path: '/register/service-provider',
    getParentRoute: () => PublicRoute,
  } as any)

const PublicRegisterNewsMemberRoute = PublicRegisterNewsMemberImport.update({
  id: '/register/news-member',
  path: '/register/news-member',
  getParentRoute: () => PublicRoute,
} as any)

const PublicRegisterInvestorcopyRoute = PublicRegisterInvestorcopyImport.update(
  {
    id: '/register/investor copy',
    path: '/register/investor copy',
    getParentRoute: () => PublicRoute,
  } as any,
)

const PublicRegisterInvestorRoute = PublicRegisterInvestorImport.update({
  id: '/register/investor',
  path: '/register/investor',
  getParentRoute: () => PublicRoute,
} as any)

const PublicNewsArticleIdRoute = PublicNewsArticleIdImport.update({
  id: '/$articleId',
  path: '/$articleId',
  getParentRoute: () => PublicNewsRouteRoute,
} as any)

const AuthedAdminAdminArticlesRouteRoute =
  AuthedAdminAdminArticlesRouteImport.update({
    id: '/admin/articles',
    path: '/admin/articles',
    getParentRoute: () => AuthedAdminRoute,
  } as any)

const AuthedAdminAdminArticlesIndexRoute =
  AuthedAdminAdminArticlesIndexImport.update({
    id: '/',
    path: '/',
    getParentRoute: () => AuthedAdminAdminArticlesRouteRoute,
  } as any)

const PublicLegalDocLegalDocumentNameRoute =
  PublicLegalDocLegalDocumentNameImport.update({
    id: '/legal/doc/$legalDocumentName',
    path: '/legal/doc/$legalDocumentName',
    getParentRoute: () => PublicRoute,
  } as any)

const AuthedAdminAdminArticlesNewRoute =
  AuthedAdminAdminArticlesNewImport.update({
    id: '/new',
    path: '/new',
    getParentRoute: () => AuthedAdminAdminArticlesRouteRoute,
  } as any)

const AuthedAdminAdminArticlesArticleIdRoute =
  AuthedAdminAdminArticlesArticleIdImport.update({
    id: '/$articleId',
    path: '/$articleId',
    getParentRoute: () => AuthedAdminAdminArticlesRouteRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_authed-admin': {
      id: '/_authed-admin'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthedAdminImport
      parentRoute: typeof rootRoute
    }
    '/_public': {
      id: '/_public'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof PublicImport
      parentRoute: typeof rootRoute
    }
    '/admin-logout': {
      id: '/admin-logout'
      path: '/admin-logout'
      fullPath: '/admin-logout'
      preLoaderRoute: typeof AdminLogoutImport
      parentRoute: typeof rootRoute
    }
    '/logout': {
      id: '/logout'
      path: '/logout'
      fullPath: '/logout'
      preLoaderRoute: typeof LogoutImport
      parentRoute: typeof rootRoute
    }
    '/_public/news': {
      id: '/_public/news'
      path: '/news'
      fullPath: '/news'
      preLoaderRoute: typeof PublicNewsRouteImport
      parentRoute: typeof PublicImport
    }
    '/_public/about-us': {
      id: '/_public/about-us'
      path: '/about-us'
      fullPath: '/about-us'
      preLoaderRoute: typeof PublicAboutUsImport
      parentRoute: typeof PublicImport
    }
    '/_public/contact-us': {
      id: '/_public/contact-us'
      path: '/contact-us'
      fullPath: '/contact-us'
      preLoaderRoute: typeof PublicContactUsImport
      parentRoute: typeof PublicImport
    }
    '/_public/': {
      id: '/_public/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof PublicIndexImport
      parentRoute: typeof PublicImport
    }
    '/_authed-admin/admin/articles': {
      id: '/_authed-admin/admin/articles'
      path: '/admin/articles'
      fullPath: '/admin/articles'
      preLoaderRoute: typeof AuthedAdminAdminArticlesRouteImport
      parentRoute: typeof AuthedAdminImport
    }
    '/_public/news/$articleId': {
      id: '/_public/news/$articleId'
      path: '/$articleId'
      fullPath: '/news/$articleId'
      preLoaderRoute: typeof PublicNewsArticleIdImport
      parentRoute: typeof PublicNewsRouteImport
    }
    '/_public/register/investor': {
      id: '/_public/register/investor'
      path: '/register/investor'
      fullPath: '/register/investor'
      preLoaderRoute: typeof PublicRegisterInvestorImport
      parentRoute: typeof PublicImport
    }
    '/_public/register/investor copy': {
      id: '/_public/register/investor copy'
      path: '/register/investor copy'
      fullPath: '/register/investor copy'
      preLoaderRoute: typeof PublicRegisterInvestorcopyImport
      parentRoute: typeof PublicImport
    }
    '/_public/register/news-member': {
      id: '/_public/register/news-member'
      path: '/register/news-member'
      fullPath: '/register/news-member'
      preLoaderRoute: typeof PublicRegisterNewsMemberImport
      parentRoute: typeof PublicImport
    }
    '/_public/register/service-provider': {
      id: '/_public/register/service-provider'
      path: '/register/service-provider'
      fullPath: '/register/service-provider'
      preLoaderRoute: typeof PublicRegisterServiceProviderImport
      parentRoute: typeof PublicImport
    }
    '/_authed-admin/admin/': {
      id: '/_authed-admin/admin/'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AuthedAdminAdminIndexImport
      parentRoute: typeof AuthedAdminImport
    }
    '/_public/news/': {
      id: '/_public/news/'
      path: '/'
      fullPath: '/news/'
      preLoaderRoute: typeof PublicNewsIndexImport
      parentRoute: typeof PublicNewsRouteImport
    }
    '/_authed-admin/admin/articles/$articleId': {
      id: '/_authed-admin/admin/articles/$articleId'
      path: '/$articleId'
      fullPath: '/admin/articles/$articleId'
      preLoaderRoute: typeof AuthedAdminAdminArticlesArticleIdImport
      parentRoute: typeof AuthedAdminAdminArticlesRouteImport
    }
    '/_authed-admin/admin/articles/new': {
      id: '/_authed-admin/admin/articles/new'
      path: '/new'
      fullPath: '/admin/articles/new'
      preLoaderRoute: typeof AuthedAdminAdminArticlesNewImport
      parentRoute: typeof AuthedAdminAdminArticlesRouteImport
    }
    '/_public/legal/doc/$legalDocumentName': {
      id: '/_public/legal/doc/$legalDocumentName'
      path: '/legal/doc/$legalDocumentName'
      fullPath: '/legal/doc/$legalDocumentName'
      preLoaderRoute: typeof PublicLegalDocLegalDocumentNameImport
      parentRoute: typeof PublicImport
    }
    '/_authed-admin/admin/articles/': {
      id: '/_authed-admin/admin/articles/'
      path: '/'
      fullPath: '/admin/articles/'
      preLoaderRoute: typeof AuthedAdminAdminArticlesIndexImport
      parentRoute: typeof AuthedAdminAdminArticlesRouteImport
    }
  }
}

// Create and export the route tree

interface AuthedAdminAdminArticlesRouteRouteChildren {
  AuthedAdminAdminArticlesArticleIdRoute: typeof AuthedAdminAdminArticlesArticleIdRoute
  AuthedAdminAdminArticlesNewRoute: typeof AuthedAdminAdminArticlesNewRoute
  AuthedAdminAdminArticlesIndexRoute: typeof AuthedAdminAdminArticlesIndexRoute
}

const AuthedAdminAdminArticlesRouteRouteChildren: AuthedAdminAdminArticlesRouteRouteChildren =
  {
    AuthedAdminAdminArticlesArticleIdRoute:
      AuthedAdminAdminArticlesArticleIdRoute,
    AuthedAdminAdminArticlesNewRoute: AuthedAdminAdminArticlesNewRoute,
    AuthedAdminAdminArticlesIndexRoute: AuthedAdminAdminArticlesIndexRoute,
  }

const AuthedAdminAdminArticlesRouteRouteWithChildren =
  AuthedAdminAdminArticlesRouteRoute._addFileChildren(
    AuthedAdminAdminArticlesRouteRouteChildren,
  )

interface AuthedAdminRouteChildren {
  AuthedAdminAdminArticlesRouteRoute: typeof AuthedAdminAdminArticlesRouteRouteWithChildren
  AuthedAdminAdminIndexRoute: typeof AuthedAdminAdminIndexRoute
}

const AuthedAdminRouteChildren: AuthedAdminRouteChildren = {
  AuthedAdminAdminArticlesRouteRoute:
    AuthedAdminAdminArticlesRouteRouteWithChildren,
  AuthedAdminAdminIndexRoute: AuthedAdminAdminIndexRoute,
}

const AuthedAdminRouteWithChildren = AuthedAdminRoute._addFileChildren(
  AuthedAdminRouteChildren,
)

interface PublicNewsRouteRouteChildren {
  PublicNewsArticleIdRoute: typeof PublicNewsArticleIdRoute
  PublicNewsIndexRoute: typeof PublicNewsIndexRoute
}

const PublicNewsRouteRouteChildren: PublicNewsRouteRouteChildren = {
  PublicNewsArticleIdRoute: PublicNewsArticleIdRoute,
  PublicNewsIndexRoute: PublicNewsIndexRoute,
}

const PublicNewsRouteRouteWithChildren = PublicNewsRouteRoute._addFileChildren(
  PublicNewsRouteRouteChildren,
)

interface PublicRouteChildren {
  PublicNewsRouteRoute: typeof PublicNewsRouteRouteWithChildren
  PublicAboutUsRoute: typeof PublicAboutUsRoute
  PublicContactUsRoute: typeof PublicContactUsRoute
  PublicIndexRoute: typeof PublicIndexRoute
  PublicRegisterInvestorRoute: typeof PublicRegisterInvestorRoute
  PublicRegisterInvestorcopyRoute: typeof PublicRegisterInvestorcopyRoute
  PublicRegisterNewsMemberRoute: typeof PublicRegisterNewsMemberRoute
  PublicRegisterServiceProviderRoute: typeof PublicRegisterServiceProviderRoute
  PublicLegalDocLegalDocumentNameRoute: typeof PublicLegalDocLegalDocumentNameRoute
}

const PublicRouteChildren: PublicRouteChildren = {
  PublicNewsRouteRoute: PublicNewsRouteRouteWithChildren,
  PublicAboutUsRoute: PublicAboutUsRoute,
  PublicContactUsRoute: PublicContactUsRoute,
  PublicIndexRoute: PublicIndexRoute,
  PublicRegisterInvestorRoute: PublicRegisterInvestorRoute,
  PublicRegisterInvestorcopyRoute: PublicRegisterInvestorcopyRoute,
  PublicRegisterNewsMemberRoute: PublicRegisterNewsMemberRoute,
  PublicRegisterServiceProviderRoute: PublicRegisterServiceProviderRoute,
  PublicLegalDocLegalDocumentNameRoute: PublicLegalDocLegalDocumentNameRoute,
}

const PublicRouteWithChildren =
  PublicRoute._addFileChildren(PublicRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof PublicRouteWithChildren
  '/admin-logout': typeof AdminLogoutRoute
  '/logout': typeof LogoutRoute
  '/news': typeof PublicNewsRouteRouteWithChildren
  '/about-us': typeof PublicAboutUsRoute
  '/contact-us': typeof PublicContactUsRoute
  '/': typeof PublicIndexRoute
  '/admin/articles': typeof AuthedAdminAdminArticlesRouteRouteWithChildren
  '/news/$articleId': typeof PublicNewsArticleIdRoute
  '/register/investor': typeof PublicRegisterInvestorRoute
  '/register/investor copy': typeof PublicRegisterInvestorcopyRoute
  '/register/news-member': typeof PublicRegisterNewsMemberRoute
  '/register/service-provider': typeof PublicRegisterServiceProviderRoute
  '/admin': typeof AuthedAdminAdminIndexRoute
  '/news/': typeof PublicNewsIndexRoute
  '/admin/articles/$articleId': typeof AuthedAdminAdminArticlesArticleIdRoute
  '/admin/articles/new': typeof AuthedAdminAdminArticlesNewRoute
  '/legal/doc/$legalDocumentName': typeof PublicLegalDocLegalDocumentNameRoute
  '/admin/articles/': typeof AuthedAdminAdminArticlesIndexRoute
}

export interface FileRoutesByTo {
  '': typeof AuthedAdminRouteWithChildren
  '/admin-logout': typeof AdminLogoutRoute
  '/logout': typeof LogoutRoute
  '/about-us': typeof PublicAboutUsRoute
  '/contact-us': typeof PublicContactUsRoute
  '/': typeof PublicIndexRoute
  '/news/$articleId': typeof PublicNewsArticleIdRoute
  '/register/investor': typeof PublicRegisterInvestorRoute
  '/register/investor copy': typeof PublicRegisterInvestorcopyRoute
  '/register/news-member': typeof PublicRegisterNewsMemberRoute
  '/register/service-provider': typeof PublicRegisterServiceProviderRoute
  '/admin': typeof AuthedAdminAdminIndexRoute
  '/news': typeof PublicNewsIndexRoute
  '/admin/articles/$articleId': typeof AuthedAdminAdminArticlesArticleIdRoute
  '/admin/articles/new': typeof AuthedAdminAdminArticlesNewRoute
  '/legal/doc/$legalDocumentName': typeof PublicLegalDocLegalDocumentNameRoute
  '/admin/articles': typeof AuthedAdminAdminArticlesIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_authed-admin': typeof AuthedAdminRouteWithChildren
  '/_public': typeof PublicRouteWithChildren
  '/admin-logout': typeof AdminLogoutRoute
  '/logout': typeof LogoutRoute
  '/_public/news': typeof PublicNewsRouteRouteWithChildren
  '/_public/about-us': typeof PublicAboutUsRoute
  '/_public/contact-us': typeof PublicContactUsRoute
  '/_public/': typeof PublicIndexRoute
  '/_authed-admin/admin/articles': typeof AuthedAdminAdminArticlesRouteRouteWithChildren
  '/_public/news/$articleId': typeof PublicNewsArticleIdRoute
  '/_public/register/investor': typeof PublicRegisterInvestorRoute
  '/_public/register/investor copy': typeof PublicRegisterInvestorcopyRoute
  '/_public/register/news-member': typeof PublicRegisterNewsMemberRoute
  '/_public/register/service-provider': typeof PublicRegisterServiceProviderRoute
  '/_authed-admin/admin/': typeof AuthedAdminAdminIndexRoute
  '/_public/news/': typeof PublicNewsIndexRoute
  '/_authed-admin/admin/articles/$articleId': typeof AuthedAdminAdminArticlesArticleIdRoute
  '/_authed-admin/admin/articles/new': typeof AuthedAdminAdminArticlesNewRoute
  '/_public/legal/doc/$legalDocumentName': typeof PublicLegalDocLegalDocumentNameRoute
  '/_authed-admin/admin/articles/': typeof AuthedAdminAdminArticlesIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/admin-logout'
    | '/logout'
    | '/news'
    | '/about-us'
    | '/contact-us'
    | '/'
    | '/admin/articles'
    | '/news/$articleId'
    | '/register/investor'
    | '/register/investor copy'
    | '/register/news-member'
    | '/register/service-provider'
    | '/admin'
    | '/news/'
    | '/admin/articles/$articleId'
    | '/admin/articles/new'
    | '/legal/doc/$legalDocumentName'
    | '/admin/articles/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | ''
    | '/admin-logout'
    | '/logout'
    | '/about-us'
    | '/contact-us'
    | '/'
    | '/news/$articleId'
    | '/register/investor'
    | '/register/investor copy'
    | '/register/news-member'
    | '/register/service-provider'
    | '/admin'
    | '/news'
    | '/admin/articles/$articleId'
    | '/admin/articles/new'
    | '/legal/doc/$legalDocumentName'
    | '/admin/articles'
  id:
    | '__root__'
    | '/_authed-admin'
    | '/_public'
    | '/admin-logout'
    | '/logout'
    | '/_public/news'
    | '/_public/about-us'
    | '/_public/contact-us'
    | '/_public/'
    | '/_authed-admin/admin/articles'
    | '/_public/news/$articleId'
    | '/_public/register/investor'
    | '/_public/register/investor copy'
    | '/_public/register/news-member'
    | '/_public/register/service-provider'
    | '/_authed-admin/admin/'
    | '/_public/news/'
    | '/_authed-admin/admin/articles/$articleId'
    | '/_authed-admin/admin/articles/new'
    | '/_public/legal/doc/$legalDocumentName'
    | '/_authed-admin/admin/articles/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AuthedAdminRoute: typeof AuthedAdminRouteWithChildren
  PublicRoute: typeof PublicRouteWithChildren
  AdminLogoutRoute: typeof AdminLogoutRoute
  LogoutRoute: typeof LogoutRoute
}

const rootRouteChildren: RootRouteChildren = {
  AuthedAdminRoute: AuthedAdminRouteWithChildren,
  PublicRoute: PublicRouteWithChildren,
  AdminLogoutRoute: AdminLogoutRoute,
  LogoutRoute: LogoutRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_authed-admin",
        "/_public",
        "/admin-logout",
        "/logout"
      ]
    },
    "/_authed-admin": {
      "filePath": "_authed-admin.tsx",
      "children": [
        "/_authed-admin/admin/articles",
        "/_authed-admin/admin/"
      ]
    },
    "/_public": {
      "filePath": "_public.tsx",
      "children": [
        "/_public/news",
        "/_public/about-us",
        "/_public/contact-us",
        "/_public/",
        "/_public/register/investor",
        "/_public/register/investor copy",
        "/_public/register/news-member",
        "/_public/register/service-provider",
        "/_public/legal/doc/$legalDocumentName"
      ]
    },
    "/admin-logout": {
      "filePath": "admin-logout.tsx"
    },
    "/logout": {
      "filePath": "logout.tsx"
    },
    "/_public/news": {
      "filePath": "_public/news/route.tsx",
      "parent": "/_public",
      "children": [
        "/_public/news/$articleId",
        "/_public/news/"
      ]
    },
    "/_public/about-us": {
      "filePath": "_public/about-us.tsx",
      "parent": "/_public"
    },
    "/_public/contact-us": {
      "filePath": "_public/contact-us.tsx",
      "parent": "/_public"
    },
    "/_public/": {
      "filePath": "_public/index.tsx",
      "parent": "/_public"
    },
    "/_authed-admin/admin/articles": {
      "filePath": "_authed-admin/admin/articles/route.tsx",
      "parent": "/_authed-admin",
      "children": [
        "/_authed-admin/admin/articles/$articleId",
        "/_authed-admin/admin/articles/new",
        "/_authed-admin/admin/articles/"
      ]
    },
    "/_public/news/$articleId": {
      "filePath": "_public/news/$articleId.tsx",
      "parent": "/_public/news"
    },
    "/_public/register/investor": {
      "filePath": "_public/register/investor.tsx",
      "parent": "/_public"
    },
    "/_public/register/investor copy": {
      "filePath": "_public/register/investor copy.tsx",
      "parent": "/_public"
    },
    "/_public/register/news-member": {
      "filePath": "_public/register/news-member.tsx",
      "parent": "/_public"
    },
    "/_public/register/service-provider": {
      "filePath": "_public/register/service-provider.tsx",
      "parent": "/_public"
    },
    "/_authed-admin/admin/": {
      "filePath": "_authed-admin/admin/index.tsx",
      "parent": "/_authed-admin"
    },
    "/_public/news/": {
      "filePath": "_public/news/index.tsx",
      "parent": "/_public/news"
    },
    "/_authed-admin/admin/articles/$articleId": {
      "filePath": "_authed-admin/admin/articles/$articleId.tsx",
      "parent": "/_authed-admin/admin/articles"
    },
    "/_authed-admin/admin/articles/new": {
      "filePath": "_authed-admin/admin/articles/new.tsx",
      "parent": "/_authed-admin/admin/articles"
    },
    "/_public/legal/doc/$legalDocumentName": {
      "filePath": "_public/legal/doc.$legalDocumentName.tsx",
      "parent": "/_public"
    },
    "/_authed-admin/admin/articles/": {
      "filePath": "_authed-admin/admin/articles/index.tsx",
      "parent": "/_authed-admin/admin/articles"
    }
  }
}
ROUTE_MANIFEST_END */
