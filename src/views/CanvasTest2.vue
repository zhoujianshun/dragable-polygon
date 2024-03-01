<template>
  <div>
    <PolygonCanvas
      :polygons="polygons"
      :canvasWidth="600"
      :canvasHeight="600"
    ></PolygonCanvas>
  </div>
</template>

<script>
import PolygonCanvas from "../components/polygon-canvas/index.vue";
export default {
  data() {
    return {
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
            { x: 300, y: 20 },
            { x: 350, y: 50 },
            { x: 350, y: 100 },
            { x: 300, y: 150 },
            { x: 250, y: 100 },
            { x: 220, y: 50 },
            { x: 300, y: 70 },
          ],
          style: {
            // lineDash: [2, 10],
            strokeColor: "red",
          },
        },
      ],
    };
  },
  components: {
    PolygonCanvas,
  },
};
</script>

<style></style>
