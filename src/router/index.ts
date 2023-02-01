import { createRouter, createWebHistory } from "vue-router";
import SudokuPage from "../views/SudokuPage/SudokuPage.vue";
import ChartPage from "../views/ChartPage/ChartPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: SudokuPage,
    },
    {
      path: "/chart",
      name: "chart",
      component: ChartPage,
    },
    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/AboutView.vue"),
    // },
  ],
});

export default router;
