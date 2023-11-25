# Sudoku

Sudoku is a logic puzzle game where the goal is to fill a 9x9 grid with digits from `1` to `9`, such that each row, column and 3x3 box contains each digit exactly once. This means that each row must have all the digits from 1 to 9, each column must have all the digits from 1 to 9, and each 3x3 box must have all the digits from 1 to 9. This creates a unique solution to the puzzle.

There are two types of strategies to solve Sudoku puzzles: **fill strategies** and **elimination strategies**.

## Fill Strategies

Fill strategies in Sudoku refer to the techniques used to determine the value of a cell in the grid when there is only one possible option. They are used when there is only one possible option for a cell.

There are three commonly used fill strategies: unique missing, naked single, and hidden single.

### Unique missing

This is the simplest strategy, where you look for a row, column or box that has only one empty cell, and fill it with the missing digit.

### Naked single

This is when a cell has only one possible digit, based on the digits already placed in its row, column and box. For example, if a cell can only be 2, 4 or 7, and its row, column and box already have 2 and 4, then the cell must be 7.

### Hidden single

This is when a digit can only go in one cell of a row, column or box, even though the cell has more than one possible digit. For example, if a row has two empty cells that can be 3 or 5, and another empty cell that can be 3, 5 or 6, then the third cell must be 6, because 3 and 5 are already taken by the other two cells.

## Elimination Strategies

Elimination strategies are based on removing possible digits from a cell or a group of cells, based on the presence of other digits in the same row, column or box. These strategies are used when there are multiple possible options for a cell and need to be narrowed down.

There are many elimination strategies, the following list some of the most common ones.

### Locked candidates

This is when a digit can only go in a certain subset of cells in a row, column or box, and therefore can be eliminated from the rest of the cells in that row, column or box. For example, if a box has two empty cells that can be 1 or 2, and they are both in the same row, then the remaining cells in that row can be eliminated as possible options for 1 and 2.

### Naked pairs

This is when two cells in a row, column or box have the same two possible digits, and no other digits. For example, if two cells can only be 4 or 9, then 4 and 9 can be eliminated from the other cells in that row, column or box. This strategy requires identifying two cells that have the same two possible digits and eliminating those digits from the remaining cells in the row, column, or box.

### Naked triplets

This is when three cells in a row, column or box have the same three possible digits, and no other digits. For example, if three cells can only be 2, 5 or 8, then 2, 5 and 8 can be eliminated from the other cells in that row, column or box. This strategy requires identifying three cells that have the same three possible digits and eliminating those digits from the remaining cells in the row, column, or box.

### Naked quads

This is when four cells in a row, column or box have the same four possible digits, and no other digits. For example, if four cells can only be 1, 3, 6 or 7, then 1, 3, 6 and 7 can be eliminated from the other cells in that row, column or box. This strategy requires identifying four cells that have the same four possible digits and eliminating those digits from the remaining cells in the row, column, or box.

### Hidden pairs

This is when two digits can only go in two cells of a row, column or box, even though those cells have more than two possible digits. For example, if two cells can be 1, 2 or 3, and another two cells can be 1, 2 or 4, then the first two cells must be 1 and 2, and the second two cells must be 3 and 4. This strategy requires analyzing the entire row, column, or box to identify two digits that can only go in two specific cells.

### Hidden triplets

This is when three digits can only go in three cells of a row, column or box, even though those cells have more than three possible digits. For example, if three cells can be 1, 2 or 3; another three cells can be 1; another three cells can be 2; and another three cells can be 3; then the first three cells must be 1, 2 and 3, and the other nine cells must be the other six digits. This strategy requires analyzing the entire row, column, or box to identify three digits that can only go in three specific cells.

### Hidden quads

This is when four digits can only go in four cells of a row, column or box, even though those cells have more than four possible digits. For example, if four cells can be 1, 2, 3 or 4; another four cells can be 1; another four cells can be 2; another four cells can be 3; and another four cells can be 4; then the first four cells must be 1, 2, 3 and 4, and the other 16 cells must be the other five digits. This strategy requires analyzing the entire row, column, or box to identify four digits that can only go in four specific cells.

### X wing

This is when two rows (or columns) have two cells each that can be the same digit, and those cells form the corners of a rectangle. For example, if row 1 and row 5 have two cells each that can be 7, and those cells are in column 2 and column 8, then 7 can be eliminated from the other cells in column 2 and column 8. This strategy requires identifying two rows (or columns) with two cells each that can be the same digit and eliminating that digit from the remaining cells in the same row (or column).

### Y wing

This is when three cells form a Y shape, such that one cell has two possible digits, and the other two cells have one of those digits and another digit. For example, if cell A can be 2 or 3, cell B can be 2 or 4, and cell C can be 3 or 4, and cell A is in the same row or column as cell B, and cell A is in the same box as cell C, then the digit that is common to cell B and cell C (in this case, 4) can be eliminated from the cells that see both cell B and cell C (in this case, the cells in the same row or column as cell B, and the cells in the same box as cell C). This strategy requires identifying three cells that form a Y shape and eliminating the common digit from the cells that see both of the other two cells.
