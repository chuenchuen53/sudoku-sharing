const input = "014860237762340018083172600027081306836007041105436782259718460648203100301694825";

function getPuzzle() {
  const arr = input.split("");
  const newArr = [];
  while (arr.length) newArr.push(arr.splice(0, 9));
  return newArr;
}

console.log(getPuzzle());
