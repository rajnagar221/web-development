let button = document.getElementById("btn");

button.addEventListener("dblclick", () => {
  document.querySelector(".box").innerHTML =
    "<b> yeyy you were clicked </b> enjoy your click !";
});

button.addEventListener("contextmenu", () => {
  alert("dont hack us by right click pls ");
});

button.addEventListener("keydown", (e) => {
  console.log(e.key, e.keycode);
});
