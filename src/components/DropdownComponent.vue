<template>
  <transition name="dropdown">
    <div v-if="show" class="dropdown-component">
      <slot />
    </div>
  </transition>
</template>
<script>
export default {
  // 这里可以添加组件的逻辑
  props: {
    show: {
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
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
  // 动画完成位置
  position: fixed;
  margin-top: 180px;
  top: 0;
  left: 0;
  right: 0;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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
</style>
