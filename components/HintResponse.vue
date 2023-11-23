<template>
  <div>
    <HintResponseView
      v-if="fillStrategy"
      :prompt="`Any ${FillStrategy.strategyName(fillStrategy)} that can be found?`"
      :first-found-response="getFillFirstFoundResp(FillStrategy.strategyName(fillStrategy), fillInputValueData?.length === 1)"
      :not-found-response="`No cell can be filled with ${FillStrategy.strategyName(fillStrategy)}`"
      :found-items="fillInputValueData ? fillInputValueData.map((x) => x.description) : null"
      :on-found-item-click="(index) => fillInputValueData && onFillDataClick(fillInputValueData[index].data)"
    ></HintResponseView>

    <HintResponseView
      v-if="eliminationStrategy"
      :prompt="`Any ${EliminationStrategy.strategyName(eliminationStrategy)} that can be found?`"
      :first-found-response="`The following pattern are ${EliminationStrategy.strategyName(eliminationStrategy)}`"
      :not-found-response="getEliminationNotFoundResp(EliminationStrategy.strategyName(eliminationStrategy))"
      :found-items="eliminationData ? eliminationData.map((x) => x.description) : null"
      :on-found-item-click="(index) => eliminationData && onEliminationDataClick(eliminationData[index].data)"
    ></HintResponseView>
  </div>
</template>

<script lang="ts" setup>
import HintResponseView from "./HintResponseView.vue";
import type { EliminationData, EliminationStrategyType } from "~/core/Sudoku/EliminationStrategy/EliminationStrategy";
import type { FillInputValueData, FillStrategyType } from "~/core/Sudoku/FillStrategy/FillStrategy";
import EliminationStrategy from "~/core/Sudoku/EliminationStrategy/EliminationStrategy";
import FillStrategy from "~/core/Sudoku/FillStrategy/FillStrategy";

defineProps<{
  fillStrategy: FillStrategyType | null;
  fillInputValueData: { description: string; data: FillInputValueData }[] | null;
  eliminationStrategy: EliminationStrategyType | null;
  eliminationData: { description: string; data: EliminationData }[] | null;
  onFillDataClick: (data: FillInputValueData) => void;
  onEliminationDataClick: (data: EliminationData) => void;
}>();

const getFillFirstFoundResp = (strategyName: string, oneOnly: boolean) => `The following cell${oneOnly ? "" : "s"} can be filled by ${strategyName}`;
const getEliminationNotFoundResp = (strategyName: string) =>
  `No pattern can be found by ${strategyName}.\nYou can try Help Fill Note and then ask again.`;
</script>
