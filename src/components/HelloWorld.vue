<template>
  <div class="circle">
    <div
      class="circle-area"
      @mousemove="mouseMove"
      @mouseleave="mouseLeave"
    ></div>
    <div v-show="visible" class="mouse-circle" :style="circleStyle"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      circleStyle: {
        left: "0px",
        top: "0px",
        transform: "scale(1)",
        opacity: "0.5",
      },
    };
  },
  methods: {
    mouseMove(e) {
      this.visible = true;
      this.circleStyle.left = `${e.clientX - 5}px`;
      this.circleStyle.top = `${e.clientY - 5}px`;
      this.circleStyle.transform = "scale(1.5)";
      this.circleStyle.opacity = "1";

      console.log(e.clientY, e.target.offsetTop);
    },
    mouseLeave() {
      this.visible = false;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.circle {
  background: red;
}
.circle-area {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: lightblue;
  position: relative;
}

.mouse-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: black;
  position: absolute;
  opacity: 0.5;
  transition: transform 0.5s, opacity 0.5s; /* 平滑变换效果 */
}
</style>
