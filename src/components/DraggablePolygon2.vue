<template>
  <div>
    <canvas
      ref="canvas"
      width="800"
      height="600"
      style="border: 1px solid black"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "DraggablePolygon",
  data() {
    return {
      polygons: [
        {
          points: [
            { x: 100, y: 100 },
            { x: 200, y: 100 },
            { x: 250, y: 200 },
            { x: 200, y: 300 },
            { x: 100, y: 300 },
            { x: 50, y: 200 },
          ],
        },
        // 可以添加更多多边形...
      ],
      radius: 10,
      drag: false,
      draggingWholePolygon: false,
      draggedPolygonIndex: null,
      draggedPointIndex: null,
      ctx: null,
      longPressTimer: null,
      startX: 0,
      startY: 0,
    };
  },
  mounted() {
    this.initCanvas();
    this.drawPolygons();
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas;
      this.ctx = canvas.getContext("2d");
      canvas.addEventListener("mousedown", this.onMouseDown);
      canvas.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
    },
    drawPolygons() {
      const { ctx, polygons, radius } = this;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      polygons.forEach((polygon) => {
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        polygon.points.forEach((point, index) => {
          if (index > 0) {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.closePath();
        ctx.fillStyle = "lightblue";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "blue";
        ctx.stroke();

        polygon.points.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = "red";
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "black";
          ctx.stroke();
        });
      });
    },
    onMouseDown(e) {
      const x = e.offsetX,
        y = e.offsetY;
      this.startX = x;
      this.startY = y;
      this.draggedPolygonIndex = null;
      this.polygons.some((polygon, polygonIndex) => {
        return polygon.points.some((point, pointIndex) => {
          if (this.pointHitTest(point, x, y)) {
            this.draggedPolygonIndex = polygonIndex;
            this.draggedPointIndex = pointIndex;
            this.drag = true;
            return true;
          }
          return false;
        });
      });
      if (this.draggedPolygonIndex !== null) {
        this.longPressTimer = setTimeout(() => {
          this.draggingWholePolygon = true;
        }, 500); // 设置500毫秒以识别长按
      }
    },
    onMouseMove(e) {
      if (this.drag && !this.draggingWholePolygon) {
        const x = e.offsetX,
          y = e.offsetY;
        this.polygons[this.draggedPolygonIndex].points[this.draggedPointIndex] =
          { x, y };
        this.drawPolygons();
      } else if (this.draggingWholePolygon) {
        const dx = e.offsetX - this.startX;
        const dy = e.offsetY - this.startY;
        this.polygons[this.draggedPolygonIndex].points.forEach((point) => {
          point.x += dx;
          point.y += dy;
        });
        this.startX = e.offsetX;
        this.startY = e.offsetY;
        this.drawPolygons();
      }
    },
    onMouseUp() {
      clearTimeout(this.longPressTimer);
      this.drag = false;
      this.draggingWholePolygon = false;
    },
    pointHitTest(point, x, y) {
      return Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) < this.radius;
    },
  },
  beforeDestroy() {
    const canvas = this.$refs.canvas;
    canvas.removeEventListener("mousedown", this.onMouseDown);
    canvas.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  },
};
</script>
