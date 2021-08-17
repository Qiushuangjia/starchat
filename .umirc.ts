import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/',
      component: '@/pages/layout/index.tsx',
      routes: [
        { path: '/', component: '@/pages/chat' },
        { path: '/login', component: '@/pages/user/login' },
      ],
    },
    // { path: '/', component: '@/pages/index' },
  ],
  fastRefresh: {},
});
