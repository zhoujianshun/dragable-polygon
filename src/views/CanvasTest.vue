<template>
  <div>
    <button @click="onAdd">添加</button>
    <DraggablePolygon
      class="canvas"
      imageSrc="https://t7.baidu.com/it/u=1595072465,3644073269&fm=193&f=GIF"
      pointFillColor="#1890ff"
      :selectedPolygon="polygons[0]"
      @update:selectedPolygon="onSelectedPolygonChanged"
      :scaleFactor="1"
      :polygons="polygons"
      :canvasWidth="600"
      :canvasHeight="600"
      @update:polygons="onUpdatePolygons"
    ></DraggablePolygon>

    <DraggablePolygon
      class="canvas"
      imageSrc="https://t7.baidu.com/it/u=1595072465,3644073269&fm=193&f=GIF"
      pointFillColor="#1890ff"
      :selectedPolygon="polygons[0]"
      @update:selectedPolygon="onSelectedPolygonChanged"
      :scaleFactor="1"
      :polygons="polygons"
      :canvasWidth="600"
      :canvasHeight="600"
      @update:polygons="onUpdatePolygons"
    ></DraggablePolygon>
  </div>
</template>

<script>
import DraggablePolygon from "../components/draggable-polygon/index.vue";
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
        {
          points: [
            { x: 120, y: 120 },
            { x: 200, y: 120 },
          ],
          style: {
            lineWidth: 4,
            // lineDash: [2, 10],
            strokeColor: "red",
          },
        },
      ],
    };
  },
  methods: {
    onSelectedPolygonChanged(p) {
      console.log({ p });
    },
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

      // this.polygons = [...this.polygons];
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
