let a = prompt("enter the first number");

let b = prompt("enter the second number");

if (isNaN(a) | isNaN(b)) {
  throw SyntaxError("sorry this is not allowed ");
}
// parseint parsefloat isliye use hota h str ko int ,float  m change krne k liye
let sum = parseInt(a) + parseInt(b);

function main() {
  let x = 1;
  // try iss ccode ko chalne ka try krrta h
  try {
    console.log("the sum is ", sum);
    return true;
  } 

  // catch ka kam yeh h age condition false hui toh error ko handle kr lega orr error  aa gya bhai dega
  catch (error) {
    console.log("error aa gya  bhai ");
    return false;
    }

    // finally k use h voh mainly try catch run hone k baad bhi finally run hoga but esa kyu
    // diect likh do consol.log but esa nhi h finally isliye use hota h ki agr return hone k
    // baad code run nhii hota h uske niche ka pr finally code return hone k baad bhi run hota h
    // mainly function use hota h
   finally {
    console.log("files are being closed and DB connection is being closed ");
  }
}

let c= main()