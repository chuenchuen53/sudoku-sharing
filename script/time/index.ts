import generateResult from "./util";

const SIZE = 10000;

generateResult("human", "simple", SIZE);
generateResult("human", "easy", SIZE);
generateResult("human", "intermediate", SIZE);
generateResult("human", "expert", SIZE);

generateResult("backtracking", "simple", SIZE);
generateResult("backtracking", "easy", SIZE);
generateResult("backtracking", "intermediate", SIZE);
generateResult("backtracking", "expert", SIZE);
