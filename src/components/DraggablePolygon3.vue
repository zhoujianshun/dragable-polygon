<template>
  <div>
    <canvas
      ref="canvas"
      width="500"
      height="500"
      @mousedown="startDrag"
      @mousemove="drag"
      @mouseup="stopDrag"
    ></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      points: [
        { x: 50, y: 50 },
        { x: 100, y: 100 },
        { x: 150, y: 80 },
        { x: 200, y: 120 },
        { x: 250, y: 100 },
        { x: 300, y: 150 },
        { x: 350, y: 130 },
        { x: 400, y: 170 },
      ],
      draggingPointIndex: -1,
      originalPoints: [],
    };
  },
  mounted() {
    this.drawPolygon();
  },
  methods: {
    drawPolygon() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);

      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }

      ctx.closePath();
      ctx.fillStyle = "lightblue";
      ctx.fill();
      ctx.stroke();

      this.drawPoints();
    },
    drawPoints() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "red";

      this.points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    startDrag(event) {
      const canvas = this.$refs.canvas;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      this.draggingPointIndex = this.findClosestPoint(mouseX, mouseY);
      this.originalPoints = [...this.points];
    },
    drag(event) {
      if (this.draggingPointIndex !== -1) {
        const canvas = this.$refs.canvas;
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.points[this.draggingPointIndex].x = mouseX;
        this.points[this.draggingPointIndex].y = mouseY;

        this.drawPolygon();
      }
    },
    stopDrag() {
      if (this.hasIntersectingLines()) {
        // Revert to the original position if there are intersecting lines
        this.points = [...this.originalPoints];
        this.drawPolygon();
      }

      this.draggingPointIndex = -1;
    },
    findClosestPoint(x, y) {
      const threshold = 10;
      let index = -1;

      this.points.forEach((point, i) => {
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        if (distance < threshold) {
          index = i;
        }
      });

      return index;
    },
    hasIntersectingLines() {
      // Add your logic to check for intersecting lines
      // For simplicity, this example always returns false
      return false;
    },
  },
};
</script>

<style scoped>
/* Add any necessary styles for your component */
</style>
