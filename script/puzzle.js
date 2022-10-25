const input = "080500000000030200009020700007000006040000050100200007008060003000301604001009000";

function getPuzzle() {
  const arr = input.split("").map((x) => (x === "0" ? null : x));
  const newArr = [];
  while (arr.length) newArr.push(arr.splice(0, 9));
  return newArr;
}

console.log(getPuzzle());
