const routes = [
  {
    path: '/',
    component: () => import('layouts/FtfLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/FtfCreateRoomPage.vue'),
      },
      {
        path: '/room/:roomId',
        component: () => import('pages/FtfRoomPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
