import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Contextmenu from "vue-contextmenujs";
Vue.use(Contextmenu);

// onContextmenu(event) {
//   // const x = event.offsetX;
//   // const y = event.offsetY;
//   // 检测右击区域
//   // 1.点击在角上，删除角上的点
//   // 2.点击在图形上，弹出删除菜单

//   this.$contextmenu({
//     items: [
//       {
//         label: "删除",
//         onClick: () => {
//           console.log("删除");
//         },
//       },
//     ],
//     event,
//     customClass: "custom-class",
//     zIndex: 3,
//     minWidth: 230,
//   });
// },
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
