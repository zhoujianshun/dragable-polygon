import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Contextmenu from "vue-contextmenujs";
Vue.use(Contextmenu);

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
