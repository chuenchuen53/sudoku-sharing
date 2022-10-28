const input = "016000002000000600050030100000003420000002070000651000300500000002090000400000089";

function getPuzzle() {
  const arr = input.split("").map((x) => (x === "0" ? null : x));
  const newArr = [];
  while (arr.length) newArr.push(arr.splice(0, 9));
  return newArr;
}

console.log(getPuzzle());
