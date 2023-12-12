# Sudoku

Sudoku is a logic puzzle game where the goal is to fill a 9x9 grid with digits from `1` to `9`, such that each row, column, and 3x3 box contains each digit exactly once. This means that each row, column and box must contain all the digits from 1 to 9. This creates the solution to the puzzle.

There are two types of strategies for solving Sudoku puzzles: **fill strategies** and **elimination strategies**.

## Fill Strategies

Fill strategies in Sudoku refer to the techniques used to determine the value of a cell in the grid when there is only one possible option. They are used when there is only one possible option for a cell.

There are three commonly used fill strategies: unique missing, naked single, and hidden single.

### Unique missing

The unique missing strategy is the simplest strategy, where you look for a row, column, or box that has only one empty cell and fill it with the missing digit.

For example, there are 8 filled cells in row 1, and the only missing digit is 3. Therefore, the empty cell in the first row must be 3.

![unique missing light](/img/strategies/unique-missing-light.png)
![unique missing dark](/img/strategies/unique-missing-dark.png)

### Naked single

The naked single strategy is when a cell has only one possible digit based on the digits already placed in its row, column, and box.

For example, for the cell r1c8, the only possible digit is `3`, so the cell can be filled with `3`.

![naked single light](/img/strategies/naked-single-light.png)
![naked single dark](/img/strategies/naked-single-dark.png)

### Hidden single

The hidden single strategy is when a digit can only go in one cell of a row, column, or box. Since the row, column, or box must contain that digit once, the cell must be filled with that digit.

For example, for digit `1`, there is only one cell (r1c3) in row 1 that can be filled with `1`, so the cell can be filled with `1`.

![hidden single light](/img/strategies/hidden-single-light.png)
![hidden single dark](/img/strategies/hidden-single-dark.png)

## Elimination Strategies

Elimination strategies are removing possible digits from a cell or a group of cells. These strategies are used when there are multiple possible options for a cell and need to be narrowed down. This can help to reduce the possibilities and reveal other clues in the puzzle.

There are many elimination strategies, and the following list some of the most common ones.

### Locked candidates

The locked candidates technique works by finding a digit that has a limited number of places to go in a row, column, or box. There are two types of locked candidates.

The first type is when a digit is restricted to a single box in a row or column. This means that the digit must be in that row or column and cannot be in any other cell of the box. Therefore, the digit can be removed from the candidates of the other cells in the same box that are not in the row or column.

For example, in row 3, the possible cells for digit `1` are all in box 2. Therefore, the digit `1` can be removed from the candidates of the other cells in box 2 that are not in row 3.

![locked candidates type1 light](/img/strategies/locked-candidates-type1-light.png)
![locked candidates type1 dark](/img/strategies/locked-candidates-type1-dark.png)

The second type is when a digit is restricted to a single row or column in a box. This means that the digit must be in that box and cannot be in any other cell of the row or column. Therefore, the digit can be removed from the candidates of the other cells in the same row or column that are not in the box.

For example, in box 3, the possible cells for digit `2` are all in row 2. Therefore, the digit `2` can be removed from the candidates of the other cells in row 7 that are not in box 3.

![locked candidates type2 light](/img/strategies/locked-candidates-type2-light.png)
![locked candidates type2 dark](/img/strategies/locked-candidates-type2-dark.png)

### Naked pairs

Naked pairs occur when you have two cells in the same row, column, or box that have only two possible candidates and they are the same. When this occurs, those values must use up all the cells and therefore can be removed from the other cells in the same row, column, or box.

For example, in column 9, the cells r4c9 and r9c9 have only two possible candidates `5` and `7`. That means that these two cells must be filled with `5` and `7`, in some order. Therefore, the digits `5` and `7` cannot be in any other cells in column 9 and can be removed from the candidates of the other cells in column 9.

![naked pairs light](/img/strategies/naked-pairs-light.png)
![naked pairs dark](/img/strategies/naked-pairs-dark.png)

### Naked triplets

Naked triplets are similar to naked pairs. It involves finding three cells in the same row, column, or box that have the same three candidates or a subset of them.

For example, in box 9, the highlighted cells have only three possible candidates `5`, `7`, and `8`. That means that these three cells must be filled with `5`, `7`, and `8`, in some order. Therefore, the digits `5`, `7`, and `8` cannot be in any other cells in box 9, and can be removed from the candidates of the other cells in box 9.

![naked triplets light](/img/strategies/naked-triplets-light.png)
![naked triplets dark](/img/strategies/naked-triplets-dark.png)

### Naked quads

Naked quads are similar to naked triplets. The difference is that naked quads involve finding four cells with the same four candidates or a subset of them.

The following figure illustrates an example of naked quads.

![naked quads light](/img/strategies/naked-quads-light.png)
![naked quads dark](/img/strategies/naked-quads-dark.png)

### Hidden pairs

A hidden pair occurs when two cells in a row, column, or box have the same two candidates, and those candidates do not appear anywhere else in that row, column, or box. This means that those two cells must contain those two candidates, and you can remove any other candidates from those cells.

For example, in row 5, the digits `3` and `4` only appear in cells r5c5 and r5c6. Therefore, the digits `3` and `4` must be in cells r5c5 and r5c6, in some order. Other candidates can be removed from these two cells.

![hidden pairs light](/img/strategies/hidden-pairs-light.png)
![hidden pairs dark](/img/strategies/hidden-pairs-dark.png)

### Hidden triplets

A hidden triplet involves finding three cells in the same row, column, or box that have the same three candidates (or a subset of them). These three cells must contain the three digits that form the triplet, so any other candidates can be eliminated from them.

For example, in column2, the digits `1`, `4`, and `9` only appear in cells r2c2, r4c2, and r5c2. Therefore, the digits `1`, `4`, and `9` must be in cells r2c2, r4c2, and r5c2, in some order. Other candidates can be removed from these three cells.

![hidden triplets light](/img/strategies/hidden-triplets-light.png)
![hidden triplets dark](/img/strategies/hidden-triplets-dark.png)

### Hidden quads

Hidden quads are similar to hidden triplets. The difference is that hidden quads involve finding four cells with the same four candidates or a subset of them.

The following figure illustrates an example of hidden quads.

![hidden quads light](/img/strategies/hidden-quads-light.png)
![hidden quads dark](/img/strategies/hidden-quads-dark.png)

### X-Wing

An X-Wing occurs when the same candidate occurs exactly twice in two rows (or columns) and in the same columns (or rows). These cells form the corners of a rectangle, so a pair of opposite corners of that rectangle must contain them, and the digit must not appear in the same column (or row) outside the corner cells.

For example, in rows 2 and 8, the digit `2` only appears twice in each row and in the same columns. There are two possible ways to fill the digit `2`. The first one is to fill `2` in cells r2c7 and r8c9. The second one is to fill `2` in cells r2c9 and r8c7. In both cases, the digit `2` cannot be in any other cells in rows 2 and 8, and can be removed from the candidates of the other cells in rows 2 and 8.

![X-Wing light](/img/strategies/x-wing-light.png)
![X-Wing dark](/img/strategies/x-wing-dark.png)

### XY-Wing

An XY-Wing involves three cells that have exactly two candidates each. These cells form a Y-shaped pattern, where the middle cell (the pivot) shares a row, column, or box with the other two cells (the pincers). The pivot cell must have two candidates that are different from the pincers, and the pincers must have one candidate in common. When this occurs, all the other cells in the intersection of the pincers cannot contain the common candidate.

For example, for the pivot r8c5, the two candidates are `2` and `8`. The two pincers are r4c5 and r8c7. The two candidates for r4c5 are `7` and `8`, which the `8` appears in the candidates of the pivot. The two candidates for r8c7 are `2` and `7`, which the `7` appears in the candidates of the pivot. Therefore, the digit `7` cannot be in any other cells in the intersection of r4c5 and r8c7, which is r4c7.

The logic behind this is that there are two possible ways to fill the pivot. The first one is to fill `2` in the pivot, which means that the pincer r8c7 must be filled with `7` and the intersection r4c7 cannot be filled with `7`. The second one is to fill `8` in the pivot, which means that the pincer r4c5 must be filled with `7` and the intersection r4c7 cannot be filled with `7`. In both cases, the digit `7` cannot be in r4c7.

![XY-Wing ex1 light](/img/strategies/xy-wing-ex1-light.png)
![XY-Wing ex1 dark](/img/strategies/xy-wing-ex1-dark.png)

The following figure illustrates another example of XY-Wing.

![XY-Wing ex2 light](/img/strategies/xy-wing-ex2-light.png)
![XY-Wing ex2 dark](/img/strategies/xy-wing-ex2-dark.png)
