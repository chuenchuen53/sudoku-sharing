<template>
  <div>
    <div class="text-lg">Input puzzle by text</div>
    <textarea
      ref="textareaRef"
      v-model="inputText"
      class="textarea textarea-bordered w-full resize-none"
      :class="errText && 'textarea-error'"
      placeholder="input text like 9024150000050... (with or without line break)"
    ></textarea>
    <div class="flex justify-end">
      <pre class="text-error flex-grow">{{ errText }}</pre>
      <button @click="handleSubmit" class="btn btn-outline btn-primary btn-sm">input</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Sudoku from "../core/Sudoku/Sudoku";
const { textarea: textareaRef, input: inputText } = useTextareaAutosize();

import type { Grid, SudokuElementWithZero } from "../core/Sudoku/type";

onMounted(() => {
  inputText.value = "206080000000000003100007240400002150000000900020700000000005009001600530300000007";
});

const props = defineProps<{
  onInput: (grid: Grid) => void;
}>();

const errText = ref("");

const handleSubmit = () => {
  inputText.value = inputText.value.trim();
  const formattedText = inputText.value.replaceAll("\n", "");
  if (!/^[0-9]+$/.test(formattedText)) {
    const invalidChar = formattedText.match(/[^0-9]/)?.[0];
    errText.value = "Non numeric character\n" + `"${invalidChar}" found.`;
    return;
  }
  if (formattedText.length !== 81) {
    errText.value = "81 characters required.\n" + `${formattedText.length} characters found.`;
    return;
  }
  const grid = Sudoku.createEmptyGrid();
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const char = formattedText[i * 9 + j] as SudokuElementWithZero;
      if (char !== "0") {
        grid[i][j].inputValue = char;
      }
    }
  }
  errText.value = "";
  props.onInput(grid);
};
</script>
