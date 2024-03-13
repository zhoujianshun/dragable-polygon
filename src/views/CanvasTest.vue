<template>
  <div>
    <button @click="onAdd">添加</button>
    <DraggablePolygon
      class="canvas"
      imageSrc="https://t7.baidu.com/it/u=1595072465,3644073269&fm=193&f=GIF"
      pointFillColor="#1890ff"
      :polygons="polygons"
      :canvasWidth="600"
      :canvasHeight="600"
      @update:polygons="onUpdatePolygons"
    ></DraggablePolygon>
  </div>
</template>

<script>
import DraggablePolygon from "../components/draggable-polygon/DraggablePolygon.vue";
export default {
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

          style: {
            // lineDash: [2, 10],
            strokeColor: "red",
          },
        },
        {
          points: [
            { x: 250, y: 50 },
            { x: 350, y: 50 },
            { x: 350, y: 150 },
            { x: 250, y: 150 },
          ],
          text: "文字编辑啊啊啊",
          keepRectangle: true, // 是否是矩形，长按拖动点的时候，会维持矩形
          style: {
            // fontSize:20,
            lineDash: [10, 2],
            selectStrokeColor: "green",
            strokeColor: "red",
          },
        },
      ],
    };
  },
  methods: {
    onUpdatePolygons() {
      console.log("onUpdatePolygons");
    },
    onAdd() {
      this.polygons.push({
        points: [
          { x: 50, y: 50 },
          { x: 100, y: 20 },
          { x: 150, y: 50 },
          { x: 150, y: 100 },
          { x: 100, y: 150 },
          { x: 50, y: 100 },
          { x: 20, y: 50 },
          { x: 100, y: 70 },
        ],
        style: {
          // lineDash: [2, 10],
          strokeColor: "red",
        },
      });
    },
  },
  components: {
    DraggablePolygon,
  },
};
</script>

<style>
.canvas {
  width: 600px;
  height: 600px;
}
</style>
