<template>
  <div class="__polygon-canvas">
    <canvas
      class="canvas"
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    ></canvas>
  </div>
</template>

<script>
// interface Polygon{
//   points:[]{x:number:y:number}
//   text?:string,
//   style:{
//     strokeColor?:string
//     lineWith?:number
//     lineDash?:[number,number]
//     font?:string
//     fontSize?:number
//     color?:string
//   },
//   [T:string]:any
// }

export default {
  name: "PolygonCanvas",
  data() {
    return {
      canvas: undefined,
      context: undefined,
      isDragging: false,
      selectedPoint: null,
    };
  },
  computed: {},
  mounted() {
    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext("2d");
    this.drawPolyons();
  },
  props: {
    polygons: {
      type: Array,
      default: undefined,
    },
    canvasWidth: {
      type: Number,
      default: undefined,
    },
    canvasHeight: {
      type: Number,
      default: undefined,
    },
    strokeColor: {
      type: String,
      default: "#1890ff",
    },
    lineWidth: {
      type: Number,
      default: 2,
    },
    lineDash: {
      type: Array,
      default: () => [0, 0],
    },
  },
  methods: {
    drawPolyons() {
      const ctx = this.context;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.polygons) {
        this.polygons.forEach((item) => {
          this.drawPolyon(item);
        });
      }
    },
    drawPolyon(polygon) {
      const ctx = this.context;
      const points = polygon.points;
      if (!points || points.length === 0) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.closePath();
      // ctx.fillStyle = "lightblue";
      // ctx.fill();

      ctx.strokeStyle = this.getStyleWithKey(polygon, "strokeColor");
      ctx.lineWidth = this.getStyleWithKey(polygon, "lineWidth");
      ctx.setLineDash(this.getStyleWithKey(polygon, "lineDash"));
      ctx.stroke();
    },
    // 获取polygon样式属性，没有则使用统一设置
    getStyleWithKey(polygon, key) {
      return polygon.style
        ? polygon.style[key]
          ? polygon.style[key]
          : this[key]
        : this[key];
    },
    handleMouseDown() {},
    handleMouseMove() {},
    handleMouseUp() {},
  },
};
</script>

<style lang="scss" scoped>
.__polygon-canvas {
  .canvas {
    background: lightgray;
    border: 1px solid #000;
  }
}
</style>
