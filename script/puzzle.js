const input = "002010000100080054060020913605000409000008100200700000900000005000040006473006001";

function getPuzzle() {
  const arr = input.split("").map((x) => (x === "0" ? null : x));
  const newArr = [];
  while (arr.length) newArr.push(arr.splice(0, 9));
  return newArr;
}

console.log(getPuzzle());
