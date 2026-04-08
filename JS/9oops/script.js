
// 🔹 OOPs kya hota hai?

// OOPs ek programming style hai jisme hum real-world cheezon ko objects aur classes ke through represent karte hain.

// let obj ={
//     a: 1,
//     b: "harry"
// }

// console.log(obj)

// let animal = {
//     eats: true
// };

// let rabbit  = {
//     jump: true
// };

class animal {
  constructor(name) {
    this.name = name;
    console.log("object is created....");
  }

  eats() {
    console.log("m kha ra hu ");
  }
  jump() {
    console.log("m kud rha hu ");
  }
}
class lion extends animal {
  constructor(name) {
    super(name);
    console.log("obj is created and he is a lion ");
  }

  eats() {
    console.log("m kh rha hu role vjkd");
  }
}

let a = new animal("bunny");
console.log(a)

let l = new lion("shera");
console.log(l)


// Constructor = object banne par run hota hai
// Destructor = object khatam hone par run hota hai

// real world
// Socho tumne ek room rent pe liya:
// Enter karte time setup karte ho → Constructor
// Room chhodte time safai karte ho → 

// 🔹 Getter aur Setter kya hote hain?

// Getter aur Setter use hote hain data ko safely access aur modify karne ke liye.

// 🔸 Getter

// Value ko get (read) karne ke liye

// 🔸 Setter

// Value ko set (change) karne ke liye