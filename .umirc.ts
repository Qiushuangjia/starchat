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
        { path: '/', component: '@/pages/chat/index_class.tsx' },
        { path: '/login', component: '@/pages/user/login' },
      ],
    },
    // { path: '/', component: '@/pages/index' },
  ],
  fastRefresh: {},
});
