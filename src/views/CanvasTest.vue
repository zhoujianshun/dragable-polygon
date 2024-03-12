<template>
  <div>
    <button @click="toggleDropdown">切换下拉</button>
    <transition name="slide">
      <dropdown-component v-if="showDropdown" />
    </transition>
    <HelloWorld></HelloWorld>
    <PolygonCanvas
      :polygons="polygons"
      :canvasWidth="600"
      :canvasHeight="600"
    ></PolygonCanvas>
    <button @click="onAdd">添加</button>
    <DraggablePolygon
      pointFillColor="#1890ff"
      :polygons="polygons"
      @update:polygons="onUpdatePolygons"
    ></DraggablePolygon>

    <DraggablePolygon2></DraggablePolygon2>
  </div>
</template>

<script>
import PolygonCanvas from "../components/polygon-canvas/index.vue";
import DraggablePolygon from "../components/DraggablePolygon.vue";
import DraggablePolygon2 from "../components/DraggablePolygon3.vue";
import HelloWorld from "../components/HelloWorld.vue";
import DropdownComponent from "../components/DropdownComponent.vue";
export default {
  data() {
    return {
      showDropdown: false,
      polygons: [
        {
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
        },
        {
          points: [
            { x: 250, y: 50 },
            { x: 350, y: 50 },
            { x: 350, y: 150 },
            { x: 250, y: 150 },
          ],
          keepRectangle: true, // 是否是矩形，长按拖动点的时候，会维持矩形
          style: {
            lineDash: [10, 2],
            selectStrokeColor: "green",
            strokeColor: "red",
          },
        },
      ],
    };
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
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
    },
  },
  components: {
    DropdownComponent,
    HelloWorld,
    DraggablePolygon2,
    DraggablePolygon,
    PolygonCanvas,
  },
};
</script>

<style></style>
