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
      :width="canvasActualWidth"
      :height="canvasActualHeight"
      :style="{
        width: canvasWidth + 'px',
        height: canvasHeight + 'px',
      }"
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
    selectedPolygon: {
      type: Object,
      default: null,
    },
    scaleFactor: {
      type: Number,
      default: 1,
    },
    //  是否可以点击边添加点
    canAddPoint: {
      type: Boolean,
      default: true,
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
    //文字
    fontSize: {
      type: Number,
      default: 12,
    },
    font: {
      type: String,
      default: "Arial bolder",
    },
    imageSrc: {
      type: String,
    },
  },
  computed: {
    // 实际宽度
    canvasActualWidth() {
      return this.canvasWidth * this.scaleFactor;
    },
    // 实际高度
    canvasActualHeight() {
      return this.canvasHeight * this.scaleFactor;
    },
  },
  created() {
    if (this.polygons) {
      this.selectedPolygonIndex = this.polygons.findIndex(
        (item) => item === this.selectedPolygon
      );
    }
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
      // 图片
      createdImage: null,
    };
  },
  mounted() {
    this.initCanvas();
    this.draw();
  },
  watch: {
    polygons(newVal) {
      console.log("watch polygons");
      // if (newVal !== oldVal) {
      let newIndex = -1;
      if (newVal) {
        newIndex = newVal.findIndex((item) => item === this.selectedPolygon);
      }
      if (newIndex === -1) {
        this.updateSelectedPolygonIndex(-1);
      }
      this.draw();
      // }
    },
  },
  methods: {
    updateSelectedPolygonIndex(polygonIndex) {
      this.selectedPolygonIndex = polygonIndex;
      this.$emit(
        "update:selectedPolygon",
        this.polygons[this.selectedPolygonIndex]
      );
    },
    initCanvas() {
      const canvas = this.$refs.canvas;
      this.ctx = canvas.getContext("2d");
      canvas.addEventListener("mousedown", this.onMouseDown);
      canvas.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
    },
    draw(mousePoint = null) {
      // 清空图片
      this.createdImage = null;
      if (!this.ctx) {
        return;
      }

      // draw
      const ctx = this.ctx;

      // 如果有图片绘制图片
      console.log(this.imageSrc);
      if (this.imageSrc) {
        const img = new Image();
        // 处理canvas使用跨域图片无法生成图片的问题
        // 需要后端配合
        img.setAttribute("crossOrigin", "Anonymous");
        img.onload = () => {
          console.log("image success");
          this.drawClear(ctx);
          ctx.drawImage(
            img,
            0,
            0,
            this.canvasActualWidth,
            this.canvasActualHeight
          );
          this.drawPolygons(mousePoint);
        };
        img.onerror = (e) => {
          console.log("image error", e);
          this.drawClear(ctx);
          this.drawPolygons(mousePoint);
        };
        img.src = `${this.imageSrc}?time=${new Date().valueOf()}`;
      } else {
        this.drawClear(ctx);
        this.drawPolygons(mousePoint);
      }
    },
    drawClear(ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "rgb(235,235,235)";
      // draw background
      // ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    },
    drawPolygons(mousePoint = null) {
      const { ctx, polygons, radius } = this;

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
        if (this.canDragPoint) {
          polygon.points.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = this.getStyleWithKey(polygon, "pointFillColor");
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.getStyleWithKey(polygon, "pointStrokeColor");
            ctx.stroke();
          });
        }
        if (polygon.text) {
          this.drawText(ctx, polygon, polygon.points[0]);
        }
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
    drawText(ctx, polygonInfo, point) {
      const font = this.getStyleWithKey(polygonInfo, "font");
      const fontSize = this.getStyleWithKey(polygonInfo, "fontSize");
      ctx.font = `${fontSize}px ${font}`;

      const textLeftPadding = 8;
      const textBottomPadding = 6;
      const textSize = ctx.measureText(polygonInfo.text);
      const rectWidth = textSize.width + textLeftPadding * 2;
      const rectHeight = fontSize + textBottomPadding * 2;
      ctx.fillStyle = this.getStyleWithKey(polygonInfo, "strokeColor");
      const lineWidth = this.getStyleWithKey(polygonInfo, "lineWidth");
      let x = point.x;
      let y = point.y - rectHeight - lineWidth;
      // 防止绘制到外部
      if (y < 0) {
        y = point.y;
      }
      if (x + rectWidth > this.canvasActualWidth) {
        x = this.canvasActualWidth - rectWidth;
      }
      ctx.fillRect(x, y, rectWidth, rectHeight);
      ctx.fillStyle = "black";
      ctx.textBaseline = "middle";
      ctx.fillText(
        polygonInfo.text,
        x + textLeftPadding,
        y + rectHeight / 2 + lineWidth
      );
    },
    pointHitTest(point, x, y) {
      return Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) < this.radius;
    },
    onMouseDown(event) {
      const btnNum = event.button;
      if (btnNum === 2) {
        // alert("您点击了鼠标右键！");
      } else if (btnNum === 0) {
        this.handleLeftMouseDown(event);
        // alert("您点击了鼠标左键！");
      } else if (btnNum === 1) {
        // alert("您点击了鼠标中键！");
      } else {
        // alert("您点击了" + btnNum + "号键，我不能确定它的名称。");
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
      const x = e.offsetX * this.scaleFactor;
      const y = e.offsetY * this.scaleFactor;
      // 用于优化性能防止，一直重绘
      const oldAddPoint = this.addPoint;
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
          // 维持矩形，不允许添加删除角
          if (polygon.keepRectangle) {
            continue;
          }
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

      const dx = x - this.startX;
      const dy = y - this.startY;
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
        this.draw();
      } else if (this.draggingWholePolygon) {
        this.polygons[this.selectedPolygonIndex].points.forEach((point) => {
          point.x += dx;
          point.y += dy;
        });

        this.draw();
      } else {
        //
        if (this.canAddPoint && this.addPoint !== oldAddPoint) {
          this.draw({
            ...this.addPoint,
          });
        }
      }
      this.startX = x;
      this.startY = y;
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
          // this.$emit("update:polygons", this.polygons);
          this.draw();
        }
      }

      this.addPoint = null;
      this.addPointPolygonIndex = null;
      this.addPointPrevIndex = null;

      this.originalPoints = [];
      this.draggingCornerPoint = false;
      this.draggingWholePolygon = false;
    },
    // 判断point，到线段的距离，若小于pointToLineMaxDistance，切到两端的距离小于radius，表示符合条件。不符合条件返回-1
    getPointToLineDistance(point, point1, point2) {
      const { distance, projection } = pointToLineDistance(
        point,
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
          return projection;
        }
      }
      return -1;
    },
    // 查找点击点，是否在多边形的边附近，是否符合添加点的条件
    searchAddPointLine(polygon, x, y, polygonIndex) {
      const points = polygon.points;
      for (let index = 0; index < points.length; index++) {
        if (points.length < 3) {
          // 两个点的直线
          continue;
        }
        const point1 = points[index];
        const point2 = points[(index + 1) % points.length];
        const projection = this.getPointToLineDistance(
          { x, y },
          point1,
          point2
        );
        if (projection !== -1) {
          this.addPoint = projection;
          this.addPointPolygonIndex = polygonIndex;
          this.addPointPrevIndex = index;
          // 找到了跳出第一层
          break;
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
        // this.$emit("update:polygons", this.polygons);
        // 如果添加点，则选中当前图形
        this.updateSelectedPolygonIndex(this.addPointPolygonIndex);

        //
        this.draw();
        return;
      }
      const x = event.offsetX * this.scaleFactor;
      const y = event.offsetY * this.scaleFactor;
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
            this.updateSelectedPolygonIndex(polygonIndex);
            this.draggedPointIndex = pointIndex;
            this.draggingCornerPoint = true;
            // 保存原始坐标，用于出措时恢复
            this.originalPoints = [...polygon.points];
            break;
          }
        }
        // 三.判断是否点击在多边形内部，用于移动多边形
        if (this.canDragMove) {
          // 1.线段，判断点是否在线段上，在线段上移动线段
          if (polygon.points.length < 3) {
            if (
              this.getPointToLineDistance(
                { x, y },
                polygon.points[0],
                polygon.points[1]
              ) !== -1
            ) {
              // 线段，点在线段上的话，移动线段
              this.draggingWholePolygon = true;
              this.updateSelectedPolygonIndex(polygonIndex);
              break;
            }
          } else {
            // 2.判断是否是在多边形内部
            if (pointInPolygon(polygon.points, x, y)) {
              // 前面没找到符合拖动的角，直接赋值用于拖动多边形
              // 设置需要拖动的图形的index
              this.updateSelectedPolygonIndex(polygonIndex);
              this.draggingWholePolygon = true;
              break;
            }
          }
        }
      }
      // 表示有选中的图形，重绘，显示选中的样式
      if (
        this.selectedPolygonIndex !== null &&
        this.selectedPolygonIndex !== undefined
      ) {
        // console.log("redraw selectedPolygonIndex:", this.selectedPolygonIndex);
        this.draw();
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
      const x = event.offsetX * this.scaleFactor;
      const y = event.offsetY * this.scaleFactor;
      for (
        let polygonIndex = this.polygons.length - 1;
        polygonIndex >= 0;
        polygonIndex--
      ) {
        const polygon = this.polygons[polygonIndex];

        // 一.判断是否可以删除点
        let draggedPolygonIndex = null;
        // canAddPoint为true表示可以添加点，所以在这里先判断是否可以删除点
        if (this.canAddPoint) {
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
                    // this.$emit("update:polygons", this.polygons);
                    this.draw();
                  },
                },
              ],
              event,
              customClass: "custom-class",
              zIndex: 9999,
              minWidth: 230,
            });
            break;
          }
        }

        if (polygon.points.length < 3) {
          //
          if (
            this.getPointToLineDistance(
              { x, y },
              polygon.points[0],
              polygon.points[1]
            ) !== -1
          ) {
            // // 线段，点在线段上的话，移动线段
            // this.draggingWholePolygon = true
            // this.updateSelectedPolygonIndex(polygonIndex)
            draggedPolygonIndex = polygonIndex;
            this.updateSelectedPolygonIndex(draggedPolygonIndex);
            this.draw();
            this.showDeleteMenu({
              event,
              label: "删除线段",
              deletePolygonIndex: draggedPolygonIndex,
            });
            break;
          }
        } else {
          // 二.判断是否删除图形
          if (pointInPolygon(polygon.points, x, y)) {
            // 前面没找到符合拖动的角，直接赋值用于拖动多边形
            // 设置需要拖动的图形的index
            draggedPolygonIndex = polygonIndex;
            this.updateSelectedPolygonIndex(draggedPolygonIndex);
            this.draw();
            this.showDeleteMenu({
              event,
              label: "删除图形",
              deletePolygonIndex: draggedPolygonIndex,
            });
            break;
          }
        }
      }
    },
    showDeleteMenu(options) {
      const { label, event, deletePolygonIndex } = options;
      this.$contextmenu({
        items: [
          {
            label: label ? label : "删除图形",
            onClick: () => {
              console.log("删除", deletePolygonIndex);
              const newList = this.polygons;
              const deleteItem = newList.splice(deletePolygonIndex, 1);
              this.$emit("deletePolygon", deleteItem);
              // this.$emit("update:polygons", newList);
              this.draw();
            },
          },
        ],
        event,
        customClass: "custom-class",
        zIndex: 9999,
        minWidth: 230,
      });
    },
    // 获取polygon样式属性，没有则使用统一设置
    getStyleWithKey(polygon, key) {
      return polygon.style
        ? polygon.style[key]
          ? polygon.style[key]
          : this[key]
        : this[key];
    },
    // 返回图片
    toImage() {
      if (this.createdImage) {
        return this.createdImage;
      }
      const canvas = this.$refs.canvas;
      if (canvas) {
        return canvas.toDataURL("image/jpg");
      }
      return null;
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
