<template>
  <!-- 
    1.拖动移动图形
    2.拖动角修改图形
    3.点击边，添加多边形的角
 -->
  <div>
    <canvas
      @contextmenu.prevent="onContextmenu"
      ref="canvas"
      width="800"
      height="600"
      style="border: 1px solid black"
    ></canvas>
  </div>
</template>

<script>
import {
  pointInPolygon,
  checkForIntersectingLines,
  pointToLineDistance,
  getLineLength,
} from "./draggable-polygon/geometry";

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
      selectedPolygonIndex: null, // 选中的polygon的index
      // 长按拖动角，改变多边形
      radius: 10,
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
      polygons.forEach((polygon, index) => {
        const selected = index === this.selectedPolygonIndex;
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
        ctx.lineWidth = selected ? 4 : 2;
        ctx.strokeStyle = selected ? "red" : "blue";
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
    onMouseDown(event) {
      const btnNum = event.button;
      if (btnNum == 2) {
        // alert("您点击了鼠标右键！");
      } else if (btnNum == 0) {
        this.handleLeftMouseDown(event);
        // alert("您点击了鼠标左键！");
      } else if (btnNum == 1) {
        // alert("您点击了鼠标中键！");
      } else {
        // alert("您点击了" + btnNum + "号键，我不能确定它的名称。");
      }
    },
    onMouseMove(e) {
      if (
        !(
          this.addPoint ||
          this.draggingWholePolygon ||
          this.draggingCornerPoint
        )
      ) {
        return;
      }

      this.addPoint = null;
      this.addPointPolygonIndex = null;
      this.addPointPrevIndex = null;

      const dx = e.offsetX - this.startX;
      const dy = e.offsetY - this.startY;
      if (this.draggingCornerPoint) {
        // const x = e.offsetX;
        // const y = e.offsetY;
        const { x, y } =
          this.polygons[this.selectedPolygonIndex].points[
            this.draggedPointIndex
          ];
        this.$set(
          this.polygons[this.selectedPolygonIndex].points,
          this.draggedPointIndex,
          { x: x + dx, y: y + dy }
        );
        this.drawPolygons();
      } else if (this.draggingWholePolygon) {
        this.polygons[this.selectedPolygonIndex].points.forEach((point) => {
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
        // 如果添加点，则选中当前图形
        this.selectedPolygonIndex = this.addPointPolygonIndex;
        this.drawPolygons();
      }

      if (!this.addPoint) {
        // 拖动角，检测是否有线段相交，如果有则还原
        if (
          this.draggingCornerPoint &&
          checkForIntersectingLines(
            this.polygons[this.selectedPolygonIndex].points
          )
        ) {
          // 新的图形存在相交的线段，还原
          this.polygons[this.selectedPolygonIndex].points = this.originalPoints;
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
    // 查找点击点，是否在多边形的边附近，是否符合添加点的条件
    searchAddPointLine(polygon, x, y, polygonIndex) {
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
    },
    // 查找是否点击多边形的角，拖动用于改变多边形尺寸
    searchMovePoint(polygon, x, y, polygonIndex) {
      return polygon.points.some((point, pointIndex) => {
        if (this.pointHitTest(point, x, y)) {
          this.selectedPolygonIndex = polygonIndex;
          this.draggedPointIndex = pointIndex;
          this.draggingCornerPoint = true;
          // 保存原始坐标，用于出措时恢复
          this.originalPoints = [...polygon.points];
          return true;
        }
        return false;
      });
    },
    handleLeftMouseDown(event) {
      const x = event.offsetX;
      const y = event.offsetY;
      this.startX = x;
      this.startY = y;
      // 后绘制的涂层在上面，逆序查找
      for (
        let polygonIndex = this.polygons.length - 1;
        polygonIndex >= 0;
        polygonIndex--
      ) {
        const polygon = this.polygons[polygonIndex];
        if (!this.addPoint) {
          // 一.点击多边形的边，添加点
          // 查找是否有点，符合点击边添加点的条件
          this.searchAddPointLine(polygon, x, y, polygonIndex);
        }
        // 二.判断是否点击多边形的角，拖动用于改变多边形尺寸
        if (this.searchMovePoint(polygon, x, y, polygonIndex)) {
          break;
        }
        // 三.判断是否点击在多边形内部，用于移动多边形
        if (pointInPolygon(polygon.points, x, y)) {
          // 前面没找到符合拖动的角，直接赋值用于拖动多边形
          // 设置需要拖动的图形的index
          this.selectedPolygonIndex = polygonIndex;
          this.draggingWholePolygon = true;
          break;
        }
      }
      // 表示有选中的图形，重绘，显示选中的样式
      if (
        this.selectedPolygonIndex !== null &&
        this.selectedPolygonIndex !== undefined
      ) {
        console.log("redraw selectedPolygonIndex:", this.selectedPolygonIndex);
        this.drawPolygons();
      }

      // if (this.draggingWholePolygon || this.draggingCornerPoint) {
      //   console.log(this.addPointPolygonIndex, this.selectedPolygonIndex);
      //   // 多种情况都符合的，需要判断图层优先级
      //   // 防止被盖住的线也添加上点
      //   if (this.addPointPolygonIndex < this.selectedPolygonIndex) {
      //     this.addPoint = null;
      //     this.addPointPolygonIndex = null;
      //     this.addPointPrevIndex = null;
      //   }
      // }
    },
    onContextmenu(event) {
      // 检测右击区域
      // 1.点击在角上，删除角上的点
      // 2.点击在图形上，弹出删除菜单
      const x = event.offsetX;
      const y = event.offsetY;
      for (
        let polygonIndex = this.polygons.length - 1;
        polygonIndex >= 0;
        polygonIndex--
      ) {
        const polygon = this.polygons[polygonIndex];

        // 一.判断是否可以删除点
        let draggedPolygonIndex = null;
        let draggedPointIndex = null;
        const r = polygon.points.some((point, pointIndex) => {
          if (this.pointHitTest(point, x, y)) {
            draggedPolygonIndex = polygonIndex;
            draggedPointIndex = pointIndex;
            return true;
          }
          return false;
        });
        //
        if (r && polygon.points.length > 3) {
          this.$contextmenu({
            items: [
              {
                label: "删除锚点",
                onClick: () => {
                  this.polygons[draggedPolygonIndex].points.splice(
                    draggedPointIndex,
                    1
                  );
                  this.drawPolygons();
                },
              },
            ],
            event,
            customClass: "custom-class",
            zIndex: 3,
            minWidth: 230,
          });
          break;
        }
        // 二.判断是否删除图形
        if (pointInPolygon(polygon.points, x, y)) {
          // 前面没找到符合拖动的角，直接赋值用于拖动多边形
          // 设置需要拖动的图形的index
          draggedPolygonIndex = polygonIndex;
          this.$contextmenu({
            items: [
              {
                label: "删除图形",
                onClick: () => {
                  console.log("删除", draggedPolygonIndex);
                  this.polygons.splice(draggedPolygonIndex, 1);
                  this.drawPolygons();
                },
              },
            ],
            event,
            customClass: "custom-class",
            zIndex: 3,
            minWidth: 230,
          });
          break;
        }
      }
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

<style lang="scss" scoped></style>
./draggable-polygon/geometry
