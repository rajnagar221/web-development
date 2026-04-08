// async  function getdata(){
//     // simulate geting data from a server
//     return new Promise((resolve ,  reject) => {
//         setTimeout(() => {
//             resolve (455)
//         }, 3500);
//     })
// }

// settle  means resolve orr reject
// resolve means Promise has settled successfully
// reject means Promise has not settled successfully

  // simulate geting data from a server
  //  let x = await fetch('https://jsonplaceholder.typicode.com/todos   /1')

  async function getdata() {
  try {
    let x = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({
        title: "foo",
        body: "bar",
        userId: 1,
      }),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    });

    let data = await x.json();
    return data;
  } catch (error) {
    console.log("Error aaya:", error);
  }
}

async function main() {
  console.log("loading modules");

  let data = await getdata();
  console.log("DATA:", data);
}

main();
