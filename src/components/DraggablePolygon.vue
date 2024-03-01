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
import {
  doLinesIntersect,
  pointInPolygon,
  checkForIntersectingLines,
  // pointToLineDistance,
} from "./geometry";

console.log(
  "doLinesIntersect:",
  doLinesIntersect(
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]
  ) === true
);

console.log(
  "doLinesIntersect1:",
  doLinesIntersect(
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ],
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ]
  ) === true
);

console.log(
  "doLinesIntersect2:",
  doLinesIntersect(
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ],
    [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
    ]
  ) === true
);

console.log(
  "doLinesIntersect3:",
  doLinesIntersect(
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]
  ) === true
);

console.log(
  "doLinesIntersect4:",
  doLinesIntersect(
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ],
    [
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ]
  ) === false
);

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
        {
          points: [
            { x: 300, y: 100 },
            { x: 400, y: 100 },
            { x: 450, y: 200 },
            { x: 400, y: 300 },
            { x: 300, y: 300 },
            { x: 250, y: 200 },
          ],
        },
      ],
      radius: 10,
      draggedPolygonIndex: null,
      draggingCornerPoint: false, // 移动角
      draggedPointIndex: null,
      originalPoints: [],
      ctx: null,
      // 是否是拖动多边形
      draggingWholePolygon: false, // 移动整个图形
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
        // console.log(polygon);
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
    pointHitTest(point, x, y) {
      return Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) < this.radius;
    },
    onMouseDown(e) {
      const x = e.offsetX;
      const y = e.offsetY;
      this.startX = x;
      this.startY = y;
      // 逆序查找
      // 判断是否点击多边形的角，用于改变多边形尺寸
      for (
        let polygonIndex = this.polygons.length - 1;
        polygonIndex >= 0;
        polygonIndex--
      ) {
        const polygon = this.polygons[polygonIndex];
        const r = polygon.points.some((point, pointIndex) => {
          if (this.pointHitTest(point, x, y)) {
            this.draggedPolygonIndex = polygonIndex;
            this.draggedPointIndex = pointIndex;
            this.draggingCornerPoint = true;
            // 保存原始坐标，用于出措时恢复
            this.originalPoints = [...polygon.points];
            return true;
          }
          return false;
        });
        if (r) {
          break;
        }
      }

      // 没有点击到多边形的角，判断是否点击在多边形内部，用于移动多边形
      // if (!this.draggingCornerPoint) {
      console.log("check pointInPolygon");
      for (
        let polygonIndex = this.polygons.length - 1;
        polygonIndex >= 0;
        polygonIndex--
      ) {
        const polygon = this.polygons[polygonIndex];
        if (pointInPolygon(polygon.points, x, y)) {
          if (
            !this.draggingCornerPoint ||
            (this.draggingCornerPoint &&
              polygonIndex > this.draggedPolygonIndex)
          ) {
            // 新找到的点所在涂层在旧涂层之上，使用新的点
            this.draggedPointIndex = null;
            this.draggingCornerPoint = false;
            this.originalPoints = [];

            this.draggedPolygonIndex = polygonIndex;
            this.draggingWholePolygon = true;
            break;
          }
        }
      }
      // }
    },
    onMouseMove(e) {
      const dx = e.offsetX - this.startX;
      const dy = e.offsetY - this.startY;
      if (this.draggingCornerPoint) {
        // const x = e.offsetX;
        // const y = e.offsetY;
        const { x, y } =
          this.polygons[this.draggedPolygonIndex].points[
            this.draggedPointIndex
          ];
        this.$set(
          this.polygons[this.draggedPolygonIndex].points,
          this.draggedPointIndex,
          { x: x + dx, y: y + dy }
        );
        this.drawPolygons();
      } else if (this.draggingWholePolygon) {
        this.polygons[this.draggedPolygonIndex].points.forEach((point) => {
          point.x += dx;
          point.y += dy;
        });

        this.drawPolygons();
      }
      this.startX = e.offsetX;
      this.startY = e.offsetY;
    },
    onMouseUp() {
      // 拖动角，检测是否有线段相交，如果有则还原
      if (
        this.draggingCornerPoint &&
        checkForIntersectingLines(
          this.polygons[this.draggedPolygonIndex].points
        )
      ) {
        this.polygons[this.draggedPolygonIndex].points = this.originalPoints;
        this.drawPolygons();
      }

      this.originalPoints = [];
      this.draggingCornerPoint = false;
      this.draggingWholePolygon = false;
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
