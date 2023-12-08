import { createRouter, createWebHistory } from 'vue-router'
import EditorView from '../views/EditorView.vue'
import RobustnessView from '../views/RobustnessView.vue'
import RobustifyView from '../views/RobustifyView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/editor'
    },
    {
      path: '/editor',
      name: 'editor',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: EditorView
    },
    {
      path: '/robustness',
      name: 'robustness',
      component: RobustnessView
    },
    {
      path: '/robustify',
      name: 'robustify',
      component: RobustifyView
    }
  ]
})

export default router
