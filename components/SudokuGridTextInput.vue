<template>
  <div class="w-full">
    <div class="mb-2 flex items-center justify-between">
      <div class="text-lg">Input puzzle by text</div>
      <details ref="detailsRef" class="dropdown dropdown-end">
        <summary class="btn btn-circle btn-ghost text-xl text-primary">
          <IconInfo />
        </summary>
        <div class="dropdown-content z-[1] w-64 rounded-box bg-base-100 shadow">
          <ul class="menu dropdown-content z-[1] w-32 space-y-2 rounded-box bg-base-100 p-2 shadow">
            <li v-for="(x, index) in samplePuzzles" :key="index">
              <button class="btn btn-ghost btn-sm" @click="() => fillSample(x)">Sample {{ index + 1 }}</button>
            </li>
          </ul>
        </div>
      </details>
    </div>
    <textarea
      ref="textareaRef"
      v-model="inputText"
      class="textarea textarea-bordered mb-2 max-h-[235px] min-h-[64px] w-full resize-none text-base leading-6"
      :class="errText && 'textarea-error'"
      placeholder="input text like 9024150000... (with or without line break)"
    ></textarea>
    <div class="flex justify-end">
      <pre class="flex-grow text-error">{{ errText }}</pre>
      <button @click="handleSubmit" class="btn btn-outline btn-primary btn-sm">input</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Sudoku from "../core/Sudoku/Sudoku";
import IconInfo from "./Icons/IconInfo.vue";
import type { Grid, SudokuElementWithZero } from "../core/Sudoku/type";

const props = defineProps<{
  onInput: (grid: Grid) => void;
}>();

const { textarea: textareaRef, input: inputText } = useTextareaAutosize({
  onResize: () => {
    if (textareaRef.value) {
      textareaRef.value.style.overflow = textareaRef.value.scrollHeight > 235 ? "auto" : "hidden";
    }
  },
});

const detailsRef = ref<HTMLDetailsElement | null>(null);
const errText = ref("");

const samplePuzzles = [
  "200603000708000000600008004090760351100059200000000400916800070000000120380500900",
  "415000060920000304700000000070090001000527040509000020006400018000000406200906003",
  "050060004\n063008000\n000030000\n000820040\n000000365\n000100080\n200709000\n400000500\n008000009",
  "065209300\n080000001\n000060000\n006030000\n050604080\n000070400\n000007000\n002405900\n900000030",
];

const fillSample = (sample: string) => {
  inputText.value = sample;
  if (detailsRef.value) detailsRef.value.removeAttribute("open");
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
