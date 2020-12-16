import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: "/",
    component: Layout,
    redirect: "/start/member"
  },
  {
    path: '/start',
    component: Layout,
    redirect: '/start/member',
    name: 'start',
    meta: { title: 'Start here', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'member',
        name: 'Membership',
        component: () => import('@/views/member/Membership'),
        meta: { title: 'Membership', icon: 'table' }
      },
      {
        path: 'swap',
        name: 'Swap',
        component: () => import('@/views/swap/index'),
        meta: { title: 'Swap', icon: 'tree' }
      }
    ]
  },

  {
    path: '/system',
    component: Layout,
    redirect: '/system/cover',
    name: 'system',
    meta: { title: 'Use the system' },
    children: [
      {
        path: 'cover',
        name: 'Cover',
        redirect: '/system/cover/default',
        component: () => import('@/views/cover/index'),
        meta: { title: 'Cover', icon: 'table' },
        children: [
            {
                path: 'default',
                name: 'DefaultCover',
                component: () => import('@/views/cover/default/index')
            },
            {
                path: 'buy',
                name: 'BuyCover',
                component: () => import('@/views/cover/buyCover/index')
            },
            {
                path: 'claim',
                name: 'CoverClaim',
                component: () => import('@/views/cover/claim/index')
            }
        ]
      },
      {
        path: 'stake',
        name: 'Stake',
        redirect: '/system/stake/default',
        component: () => import('@/views/stake/index'),
        meta: { title: 'Stake', icon: 'tree' },
        children: [
            {
                path: 'default',
                name: 'DefaultStake',
                component: () => import('@/views/stake/default/index')
            },
            {
                path: 'stats',
                name: 'StatsStake',
                component: () => import('@/views/stake/stats/index')
            },
            {
                path: 'stake',
                name: 'StakeStake',
                component: () => import('@/views/stake/stake/index')
            },
            {
                path: 'withdraw',
                name: 'WithdrawDeposit',
                component: () => import('@/views/stake/withdraw/index')
            }
        ]
      },
      {
        path: 'claim',
        name: 'Claim',
        redirect: '/system/claim/default',
        component: () => import('@/views/claim/index'),
        meta: { title: 'Claim Assessment', icon: 'tree' },
        children: [
            {
                path: 'default',
                name: 'DefaultClaim',
                component: () => import('@/views/claim/default/index')
            },
            {
                path: 'assess',
                name: 'AssessClaim',
                component: () => import('@/views/claim/assess/index')
            }
        ]
      },
      {
        path: 'governance',
        name: 'Governance',
        component: () => import('@/views/governance/index'),
        meta: { title: 'Governance', icon: 'tree' }
      },
      {
        path: 'reward',
        name: 'Reward',
        component: () => import('@/views/reward/index'),
        meta: { title: 'Reward', icon: 'tree' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
