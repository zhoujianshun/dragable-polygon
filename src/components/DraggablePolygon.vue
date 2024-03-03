<template>
  <!-- 
    1.拖动移动图形
    2.拖动角修改图形
    3.点击边，添加多边形的角
 -->
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
  pointToLineDistance,
  getLineLength,
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
      ctx: null,
      // 长按拖动角，改变多边形
      radius: 10,
      draggedPolygonIndex: null,
      draggingCornerPoint: false, // 移动角
      draggedPointIndex: null,
      originalPoints: [],
      // 是否是拖动多边形
      draggingWholePolygon: false, // 移动整个图形
      startX: 0,
      startY: 0,
      // 点击多边形的边添加点
      addPoint: null,
      addPointPolygonIndex: null,
      addPointPrevIndex: null,
      pointToLineMaxDistance: 4, // 点击的点到，边的最短距离，小于即可添加
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
      console.log({ polygons });
      polygons.forEach((polygon) => {
        console.log(polygon);
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
      // 后绘制的涂层在上面，逆序查找
      // 一.点击多边形的边，添加点
      for (
        let polygonIndex = this.polygons.length - 1;
        polygonIndex >= 0;
        polygonIndex--
      ) {
        const polygon = this.polygons[polygonIndex];
        const points = polygon.points;
        for (let index = 0; index < points.length; index++) {
          const point1 = points[index];
          const point2 = points[(index + 1) % points.length];
          const { distance, projection } = pointToLineDistance(
            { x, y },
            point1,
            point2
          );
          // 距离小于pointToLineMaxDistance才可添加
          if (distance < this.pointToLineMaxDistance) {
            // 点击的点到线段的垂直点，距离线段两端的距离，小于pointToLineMaxDistance才可以添加
            // 防止添加的点，距离线段两端太近
            // 添加此判断，也可以避免，点击的点，距离多条边都符合要求的情况
            if (
              getLineLength(projection, point1) > this.pointToLineMaxDistance &&
              getLineLength(projection, point2) > this.pointToLineMaxDistance
            ) {
              this.addPoint = projection;
              this.addPointPolygonIndex = polygonIndex;
              this.addPointPrevIndex = index;
              // 找到了跳出第一层
              break;
            }
          }
        }
        if (this.addPoint) {
          break;
        }
      }
      // 二.判断是否点击多边形的角，拖动用于改变多边形尺寸
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

      // 三.判断是否点击在多边形内部，用于移动多边形
      // if (!this.draggingCornerPoint) {
      console.log("check pointInPolygon");
      for (
        let polygonIndex = this.polygons.length - 1;
        polygonIndex >= 0;
        polygonIndex--
      ) {
        const polygon = this.polygons[polygonIndex];
        if (pointInPolygon(polygon.points, x, y)) {
          if (!this.draggingCornerPoint) {
            // 前面没找到符合拖动的角，直接赋值用于拖动多边形
            // 设置需要拖动的图形的index
            this.draggedPolygonIndex = polygonIndex;
            this.draggingWholePolygon = true;
            break;
          } else {
            // 前面找到了符合拖动的角，则需要判断两个图层的覆盖关系，图层索引大的在上面，优先级大
            if (polygonIndex > this.draggedPolygonIndex) {
              // 点击的点，符合拖动图片的要求，并且如果前面也符合拖动角的要求，则判断多边形的索引，保留大的
              // 新找到的点所在涂层在旧涂层之上，使用新的点
              this.draggedPointIndex = null;
              this.draggingCornerPoint = false;
              this.originalPoints = [];

              // 设置需要拖动的图形的index
              this.draggedPolygonIndex = polygonIndex;
              this.draggingWholePolygon = true;
              break;
            } else {
              // 找到的第一个符合要求的图层，索引已经小于，拖动角图层的索引，其他的不需要判断了，直接退出循环
              break;
            }
          }
        }
      }
      // }

      if (this.draggingWholePolygon || this.draggingCornerPoint) {
        console.log(this.addPointPolygonIndex, this.draggedPolygonIndex);
        // 多种情况都符合的，需要判断图层优先级
        // 防止被盖住的线也添加上点
        if (this.addPointPolygonIndex < this.draggedPolygonIndex) {
          this.addPoint = null;
          this.addPointPolygonIndex = null;
          this.addPointPrevIndex = null;
        }
      }
    },
    onMouseMove(e) {
      this.addPoint = null;
      this.addPointPolygonIndex = null;
      this.addPointPrevIndex = null;

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
      if (this.addPoint) {
        console.log("addPoint", this.addPoint);
        this.polygons[this.addPointPolygonIndex].points.splice(
          this.addPointPrevIndex + 1,
          0,
          this.addPoint
        );
        this.drawPolygons();
      }

      // 拖动角，检测是否有线段相交，如果有则还原
      if (!this.addPoint) {
        if (
          this.draggingCornerPoint &&
          checkForIntersectingLines(
            this.polygons[this.draggedPolygonIndex].points
          )
        ) {
          this.polygons[this.draggedPolygonIndex].points = this.originalPoints;
          this.drawPolygons();
        }
      }

      this.addPoint = null;
      this.addPointPolygonIndex = null;
      this.addPointPrevIndex = null;

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
