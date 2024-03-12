<template>
  <div class="about">
    <button @click="show = !show">点击弹出</button>
    <!-- <transition name="dropdown">
      <div v-if="show" class="dropdown-component">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
          facilisis enim libero, at lacinia diam fermentum id. Pellentesque
          habitant morbi tristique senectus et netus.
        </p>
      </div>
    </transition> -->
    <DropdownComponent :show="show">
      <p>
        aaa Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        facilisis enim libero, at lacinia diam fermentum id. Pellentesque
        habitant morbi tristique senectus et netus.
      </p>
    </DropdownComponent>
  </div>
</template>

<script>
import DropdownComponent from "../components/DropdownComponent.vue";
export default {
  components: { DropdownComponent },
  data() {
    return {
      show: false,
    };
  },
  mounted() {},
};
</script>

<style lang="scss">
.dropdown-enter-active {
  animation: slideDown 0.5s;
}
.dropdown-leave-active {
  animation: slideDown 0.5s reverse;
}
.dropdown-leave-to {
  // display: none;
  // top: -100%;
}
.dropdown-enter {
  top: -100%;
}

/* style.css */
.dropdown-component {
  // display: none; /* 初始不显示 */
  position: fixed;
  margin-top: 180px;
  top: 0;
  left: 0;
  right: 0;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  // animation: slideDown 0.5s forwards;
}

/* 定义向下滑动的关键帧动画 */
@keyframes slideDown {
  from {
    top: -100%; /* 从上方开始 */
  }
  to {
    top: 0; /* 下滑至顶部 */
  }
}

/* style.css中添加 */
@keyframes slideUp {
  from {
    top: 0;
  }
  to {
    top: -100%; /* 向上滑动并消失 */
  }
}

/* 可见时应用动画 */
.dropdown-visible {
  display: block;
}
</style>
