class user {
  constructor(name) {
    // invooke the setter
    this.name = name;
  }
  get name() {
    return this._name;
  }

  set name(value) {
    if (value.lenth < 4) {
      console.log("name is  too short ");
      return;
    }
    this._name = value;
  }
}

let user = new user("jhon");
console.log("user.name ")

 user.name = "harry" //name is too short
console.log(user)