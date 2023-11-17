import type { Position, SudokuElement } from "../core/Sudoku/type";
import Sudoku from "~/core/Sudoku/Sudoku";

export const useSolverState = () =>
  useState("solverState", () => {
    const inputGrid = Sudoku.createEmptyGrid();
    let invalidPositions: Position[] = [];
    let selectedPosition = {
      rowIndex: 0,
      columnIndex: 0,
    };

    const setSelectPosition = (position: Position) => {
      selectedPosition = position;
    };

    const fillInGrid = (e: SudokuElement) => {
      const { rowIndex, columnIndex } = selectedPosition;
      inputGrid[rowIndex][columnIndex].inputValue = e;
      invalidPositions = Sudoku.invalidCells(inputGrid);
    };

    const clearInGrid = () => {
      const { rowIndex, columnIndex } = selectedPosition;
      delete inputGrid[rowIndex][columnIndex].inputValue;
      invalidPositions = Sudoku.invalidCells(inputGrid);
    };

    const pageState = {
      inputGrid,
      invalidPositions,
      selectedPosition,
    };

    return ref({ pageState, setSelectPosition, fillInGrid, clearInGrid });
  });
