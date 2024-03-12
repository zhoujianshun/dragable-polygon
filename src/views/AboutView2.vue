<template>
  <div class="about">
    <button id="toggleButton">点击弹出</button>
    <div id="dropdownComponent" class="dropdown-component">
      <p>弹出的内容2</p>
      <p>弹出的内容2</p>
      <!-- <p>弹出的内容2</p> -->
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    document
      .getElementById("toggleButton")
      .addEventListener("click", function () {
        var dropdown = document.getElementById("dropdownComponent");
        if (dropdown.classList.contains("dropdown-visible")) {
          // 先应用slideUp动画，然后隐藏组件
          dropdown.style.animation = "slideUp 0.5s forwards";
          setTimeout(() => {
            dropdown.classList.remove("dropdown-visible");
            dropdown.style.display = "none"; // 动画完成后隐藏
            dropdown.style.animation = ""; // 清除动画，以便下次显示时可以重新触发slideDown动画
          }, 500); // 确保这个时间与slideUp动画的持续时间相匹配
        } else {
          dropdown.style.display = "block"; // 先显示，以确保动画能播放
          setTimeout(() => {
            dropdown.classList.add("dropdown-visible");
            dropdown.style.animation = "slideDown 0.5s forwards"; // 应用slideDown动画
          }, 0);
        }
      });
  },
};
</script>

<style>
.dropdown-component {
  display: none; /* 初始不显示 */
  position: fixed;
  top: -100%;
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

/* 定义向上滑动的关键帧动画 */
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
