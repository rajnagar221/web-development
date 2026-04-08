console.log("harry is hacker")
console.log("rohan is hecker")

setTimeout(() => {
    console.log("ia m inside settimeout")
}, 0);


setTimeout(() => {
    console.log("ia m inside settimeout")
}, 0);

console.log("the end ")

const fn = () => {
    console.log("noting")
}

const callbackk = (arg , fn) => {
    console.log(arg)
    fn()
}

const loadScript = (src , callbackk) => {
    let sc = document.createElement("script")
    sc.src = src;
    sc.onload = callbackk("harry" , fn);
    document.head.append(sc)
}

loadScript("https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects", callbackk)