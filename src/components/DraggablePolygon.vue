<template>
  <!-- 
    1.拖动移动图形
    2.拖动角修改图形
    3.点击边，添加多边形的角
 -->
  <div class="canvas-wrapper">
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
  movePointToKeepRectangle,
} from "./geometry";

export default {
  name: "DraggablePolygon",
  props: {
    //  是否可以点击边添加点
    canAddPoint: {
      type: Boolean,
      default: false,
    },
    // 是否可以长按拖动图形
    canDragMove: {
      type: Boolean,
      default: true,
    },
    // 是否可以长按拖动点
    canDragPoint: {
      type: Boolean,
      default: true,
    },
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
    fillColor: {
      type: String,
      // default: "lightblue",
    },
    strokeColor: {
      type: String,
      default: "#1890ff",
    },
    selectStrokeColor: {
      type: String,
      default: "#1890ff",
    },
    lineWidth: {
      type: Number,
      default: 1,
    },
    selectedLineWidth: {
      type: Number,
      default: 2,
    },
    pointFillColor: {
      type: String,
      default: "red",
      // default: "#1890ff",
    },
    pointStrokeColor: {
      type: String,
      default: "#1890ff",
      // default: "black",
    },
    radius: {
      type: Number,
      default: 5,
    },
    lineDash: {
      type: Array,
      default: () => [0, 0],
    },
  },
  data() {
    return {
      ctx: null,
      selectedPolygonIndex: null, // 选中的polygon的index
      // 长按拖动角，改变多边形
      // radius: 10,
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
  watch: {
    polygons() {
      console.log("watch polygons");
      this.drawPolygons();
    },
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas;
      this.ctx = canvas.getContext("2d");
      canvas.addEventListener("mousedown", this.onMouseDown);
      canvas.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
    },
    drawPolygons(mousePoint = null) {
      const { ctx, polygons, radius } = this;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      console.log({ polygons });
      polygons.forEach((polygon, index) => {
        const selected = index === this.selectedPolygonIndex;
        // console.log(polygon);
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        polygon.points.forEach((point, index) => {
          if (index > 0) {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.closePath();
        if (this.fillColor) {
          ctx.fillStyle = this.getStyleWithKey(polygon, "fillColor");
          ctx.fill();
        }
        ctx.setLineDash(this.getStyleWithKey(polygon, "lineDash"));
        ctx.lineWidth = selected
          ? this.getStyleWithKey(polygon, "selectedLineWidth")
          : this.getStyleWithKey(polygon, "lineWidth");
        ctx.strokeStyle = selected
          ? this.getStyleWithKey(polygon, "selectStrokeColor")
          : this.getStyleWithKey(polygon, "strokeColor");
        ctx.stroke();

        polygon.points.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = this.getStyleWithKey(polygon, "pointFillColor");
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = this.getStyleWithKey(polygon, "pointStrokeColor");
          ctx.stroke();
        });
      });

      if (mousePoint) {
        // ctx.beginPath();
        // ctx.arc(mousePoint.x, mousePoint.y, 5, 0, Math.PI * 2);
        // ctx.fillStyle = "black";
        // ctx.fill();
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = "black";
        // ctx.stroke();
        // const canvas = document.getElementById("myCanvas");
        // const ctx = canvas.getContext("2d");
        this.drawAddCircle(ctx, mousePoint);
      }
    },
    // 绘制鼠标在可添加点时显示的圆形➕号
    drawAddCircle(ctx, center) {
      // 设置圆的中心点坐标
      const centerX = center.x;
      const centerY = center.y;
      const radius = 8;

      // 绘制圆
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = this.pointFillColor;
      ctx.fill();
      ctx.closePath();

      // 设置加号的属性
      const plusSize = 10; // 加号的尺寸

      // 绘制加号的竖线
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - plusSize / 2);
      ctx.lineTo(centerX, centerY + plusSize / 2);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      // 绘制加号的横线
      ctx.beginPath();
      ctx.moveTo(centerX - plusSize / 2, centerY);
      ctx.lineTo(centerX + plusSize / 2, centerY);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
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
    movePointToKeepRectangle(rect, pointIndex, newX, newY) {
      // 计算中心点
      const centerX = (rect[0].x + rect[1].x + rect[2].x + rect[3].x) / 4;
      const centerY = (rect[0].y + rect[1].y + rect[2].y + rect[3].y) / 4;

      // 更新被移动的点
      rect[pointIndex].x = newX;
      rect[pointIndex].y = newY;

      // 对于每个点，如果不是被移动的点也不是对角点，更新它的位置
      for (let i = 0; i < rect.length; i++) {
        if (i !== pointIndex && (i + pointIndex) % 2 === 0) {
          // 确定不是对角点
          const oppositeIndex = (pointIndex + 2) % 4; // 找到对角点的索引
          rect[i].x = 2 * centerX - rect[oppositeIndex].x;
          rect[i].y = 2 * centerY - rect[oppositeIndex].y;
        }
      }
    },
    onMouseMove(e) {
      // if (
      //   !(
      //     this.addPoint ||
      //     this.draggingWholePolygon ||
      //     this.draggingCornerPoint
      //   )
      // ) {
      //   return;
      // }
      const x = e.offsetX;
      const y = e.offsetY;
      this.addPoint = null;

      if (this.canAddPoint) {
        // 检测是否可以点击边添加点
        let inPolygonIndex = null;
        // 后绘制的涂层在上面，逆序查找
        for (
          let polygonIndex = this.polygons.length - 1;
          polygonIndex >= 0;
          polygonIndex--
        ) {
          const polygon = this.polygons[polygonIndex];
          if (!inPolygonIndex && pointInPolygon(polygon.points, x, y)) {
            //
            inPolygonIndex = polygonIndex;
          }
          const pointIndex = this.searchMovePoint(polygon, x, y);
          if (!inPolygonIndex && pointIndex !== -1) {
            //
            inPolygonIndex = polygonIndex;
          }

          // 一.点击多边形的边，添加点
          // 查找是否有点，符合点击边添加点的条件
          this.searchAddPointLine(polygon, x, y, polygonIndex);
          // 防止点出现在被图层覆盖的线上
          if (inPolygonIndex && this.addPoint) {
            if (this.addPointPolygonIndex < inPolygonIndex) {
              this.addPoint = null;
              this.addPointPolygonIndex = null;
              this.addPointPrevIndex = null;
              break;
            }
          }
        }
      }

      const dx = e.offsetX - this.startX;
      const dy = e.offsetY - this.startY;
      if (this.draggingCornerPoint) {
        // const x = e.offsetX;
        // const y = e.offsetY;
        const polygon = this.polygons[this.selectedPolygonIndex];
        const { x, y } = polygon.points[this.draggedPointIndex];
        if (polygon.keepRectangle && polygon.points.length === 4) {
          // 保持矩形
          movePointToKeepRectangle(
            polygon.points,
            this.draggedPointIndex,
            x + dx,
            y + dy
          );
        } else {
          this.$set(polygon.points, this.draggedPointIndex, {
            x: x + dx,
            y: y + dy,
          });
        }
        this.drawPolygons();
      } else if (this.draggingWholePolygon) {
        this.polygons[this.selectedPolygonIndex].points.forEach((point) => {
          point.x += dx;
          point.y += dy;
        });

        this.drawPolygons();
      } else {
        if (this.canAddPoint) {
          this.drawPolygons({
            ...this.addPoint,
          });
        }
      }
      this.startX = e.offsetX;
      this.startY = e.offsetY;
    },
    onMouseUp() {
      if (!this.addPoint) {
        // 拖动角，检测是否有线段相交，如果有则还原
        if (
          this.draggingCornerPoint &&
          checkForIntersectingLines(
            this.polygons[this.selectedPolygonIndex].points
          )
        ) {
          // 新的图形存在相交的线段，还原
          const curPolygon = this.polygons[this.selectedPolygonIndex];
          curPolygon.points = this.originalPoints;
          this.$emit("update:polygons", this.polygons);
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
            getLineLength(projection, point1) > this.radius &&
            getLineLength(projection, point2) > this.radius
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
    searchMovePoint(polygon, x, y) {
      // 倒序查找
      let index = -1;
      for (
        let pointIndex = polygon.points.length - 1;
        pointIndex >= 0;
        pointIndex--
      ) {
        const point = polygon.points[pointIndex];
        if (this.pointHitTest(point, x, y)) {
          // this.selectedPolygonIndex = polygonIndex;
          // this.draggedPointIndex = pointIndex;
          // this.draggingCornerPoint = true;
          // // 保存原始坐标，用于出措时恢复
          // this.originalPoints = [...polygon.points];
          index = pointIndex;
          break;
        }
      }
      return index;
    },
    handleLeftMouseDown(event) {
      if (this.addPoint) {
        console.log(
          "addPoint",
          this.addPoint,
          this.addPointPolygonIndex,
          this.addPointPrevIndex
        );
        const polygon = this.polygons[this.addPointPolygonIndex];
        polygon.points.splice(this.addPointPrevIndex + 1, 0, this.addPoint);
        this.$emit("update:polygons", this.polygons);
        // 如果添加点，则选中当前图形
        this.selectedPolygonIndex = this.addPointPolygonIndex;
        this.drawPolygons();
        return;
      }
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
        // if (!this.addPoint) {
        //   // 一.点击多边形的边，添加点
        //   // 查找是否有点，符合点击边添加点的条件
        //   this.searchAddPointLine(polygon, x, y, polygonIndex);
        // }
        // 二.判断是否点击多边形的角，拖动用于改变多边形尺寸
        if (this.canDragPoint) {
          const pointIndex = this.searchMovePoint(polygon, x, y);
          if (pointIndex !== -1) {
            this.selectedPolygonIndex = polygonIndex;
            this.draggedPointIndex = pointIndex;
            this.draggingCornerPoint = true;
            // 保存原始坐标，用于出措时恢复
            this.originalPoints = [...polygon.points];
            break;
          }
        }
        // 三.判断是否点击在多边形内部，用于移动多边形
        if (this.canDragMove) {
          if (pointInPolygon(polygon.points, x, y)) {
            // 前面没找到符合拖动的角，直接赋值用于拖动多边形
            // 设置需要拖动的图形的index
            this.selectedPolygonIndex = polygonIndex;
            this.draggingWholePolygon = true;
            break;
          }
        }
      }
      // 表示有选中的图形，重绘，显示选中的样式
      if (
        this.selectedPolygonIndex !== null &&
        this.selectedPolygonIndex !== undefined
      ) {
        // console.log("redraw selectedPolygonIndex:", this.selectedPolygonIndex);
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
                  const polygon = this.polygons[draggedPolygonIndex];
                  polygon.points.splice(draggedPointIndex, 1);
                  this.$emit("update:polygons", this.polygons);
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
                  const newList = this.polygons;
                  newList.splice(draggedPolygonIndex, 1);
                  this.$emit("update:polygons", newList);
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
    // 获取polygon样式属性，没有则使用统一设置
    getStyleWithKey(polygon, key) {
      return polygon.style
        ? polygon.style[key]
          ? polygon.style[key]
          : this[key]
        : this[key];
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

<style lang="scss" scoped>
.canvas-wrapper {
  position: relative;
  .mouse-circle {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: black;
    position: absolute;
    opacity: 0.5;
    transition: transform 0.5s, opacity 0.5s; /* 平滑变换效果 */
  }
}
</style>
