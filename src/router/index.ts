import { createRouter, createWebHistory } from "vue-router";
import SudokuPage from "../views/SudokuPage/SudokuPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: SudokuPage,
    },
  ],
});

export default router;
