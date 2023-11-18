<template>
  <div class="w-full">
    <div class="flex justify-between">
      <div class="text-lg mb-4">Input puzzle by text</div>
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-circle btn-ghost btn-xs text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </label>
        <div tabindex="0" class="card compact dropdown-content z-[1] shadow bg-base-100 rounded-box w-64">
          <div class="card-body">
            <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-32 space-y-2">
              <li v-for="(x, index) in samplePuzzles" :key="index">
                <button class="btn btn-ghost btn-sm" @click="() => fillSample(x)">Sample {{ index + 1 }}</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <textarea
      ref="textareaRef"
      v-model="inputText"
      class="textarea textarea-bordered w-full resize-none max-h-72 mb-2 leading-6"
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
import type { Grid, SudokuElementWithZero } from "../core/Sudoku/type";

const props = defineProps<{
  onInput: (grid: Grid) => void;
}>();

const { textarea: textareaRef, input: inputText } = useTextareaAutosize({
  onResize: () => {
    if (textareaRef.value) {
      textareaRef.value.style.overflow = textareaRef.value.scrollHeight > 288 ? "auto" : "hidden";
    }
  },
});

const errText = ref("");

const samplePuzzles = [
  "200603000708000000600008004090760351100059200000000400916800070000000120380500900",
  "415000060920000304700000000070090001000527040509000020006400018000000406200906003",
  "050060004\n063008000\n000030000\n000820040\n000000365\n000100080\n200709000\n400000500\n008000009",
  "065209300\n080000001\n000060000\n006030000\n050604080\n000070400\n000007000\n002405900\n900000030",
];

const fillSample = (sample: string) => {
  inputText.value = sample;
  textareaRef.value?.focus();
};

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
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>
