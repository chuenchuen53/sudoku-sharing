<template>
  <div><apexcharts width="500" type="scatter" :options="chartOptions" :series="series"></apexcharts></div>
</template>

<script setup lang="ts">
import apexcharts from "vue3-apexcharts";
import simple from "./human-simple.json";
import easy from "./human-easy.json";
import intermediate from "./human-intermediate.json";

const result = [
  ...simple.result.map((item) => [item.numberOfClues, item.timeSpent]),
  ...easy.result.map((item) => [item.numberOfClues, item.timeSpent]),
  ...intermediate.result.map((item) => [item.numberOfClues, item.timeSpent]),
];

const chartOptions = {
  xaxis: {
    type: "numeric",
    labels: {
      show: true,
      rotate: 0,
      showDuplicates: false,
      hideOverlappingLabels: true,
    },
    // tickAmount: 10,
    tickPlacement: "on",
    decimalsInFloat: 0,
  },
  yAxis: {},
};

const series = [
  {
    symbolSize: 1,
    data: result.sort((a, b) => a[0] - b[0]),
    type: "scatter",
  },
];
</script>

<style scoped></style>
