`use strict`;
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(childOfVector) {
    if (childOfVector instanceof Vector) {
      let newVect = new Vector();
      newVect.x = newVect.x + this.x + childOfVector.x;
      newVect.y = newVect.y + this.y + childOfVector.y;
      return newVect;
    } else {
      throw new Error (`Можно прибавлять к вектору только вектор типа Vector`);
    }
  }
  times(multiplier) {
    let newVect = new Vector();
    newVect.x = newVect.x + (this.x * multiplier);
    newVect.y = newVect.y + (this.y * multiplier);
    return newVect;
  }
}
class Actor {
  constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if ((position instanceof Vector) && (size instanceof Vector) && (speed instanceof Vector)) {
      this.pos = position;
      this.size = size;
      this.speed = speed;
      this.actor = `actor`;
    } else {
      throw new Error (`Ошибка в Actor`);
    }
  }
  act() {
    
  }
  get left() {
    return this.pos.x;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get top() {
    return this.pos.y;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
  get type() {
    return this.actor.toString();
  }
  isIntersect(movingObject){
        if (!(movingObject instanceof Actor)){
            throw new Error ('Ошибка в isIntersect');
        }
        if (movingObject === this){
            return false;
        }
        return !( this.top >= movingObject.bottom || this.bottom <= movingObject.top || this.right <= movingObject.left || this.left >= movingObject.right );
  }
}
class Level {
  constructor(grid, actors) {
    this.grid = grid;
    if(actors){
      this.actors = actors;
      this.player = (this.actors.find(function (el) {
          return (el.type === 'player');
        }));
      }
    if (grid) {
      this.height = grid.length;
      if (grid[0]) {
        let widthOfgrid = 0;
        for (let i = 0; i < grid.length; i++) {
          if (widthOfgrid < grid[i].length) {
            widthOfgrid = grid[i].length;
          }
        }
        this.width = widthOfgrid;
      } else {
        this.width = 0;
      }
    } else {
      this.height = 0;
      this.width = 0;
    }
    this.status = null;
    this.finishDelay = 1;
  }
  isFinished() {
    if ((this.status !== null)  && (this.finishDelay < 0)) {
      return true;
    } else {
      return false;
    }
  }
  actorAt(objectForCheck) {
    if ((objectForCheck === undefined) || !(objectForCheck instanceof Actor)) {
      throw new Error (`Ошибка в actorAt`);
    } else {
      let crossedObject;
      if (this.actors) {
        for (let i = 0; i < this.actors.length; i++) {
          if (this.actors[i] !== undefined) {
            if (this.actors[i].isIntersect(objectForCheck) === true) {
              crossedObject = this.actors[i];
              break;
            }
          }
        }
      } else {
        return undefined;
      }
      return crossedObject;
    }
  }
 obstacleAt(moveTo, size) {
    if ( !(moveTo instanceof Vector) || !(size instanceof Vector) ){
      throw new Error ('Ошибка в obstacleAt');
    }
    let newActor = new Actor(moveTo, size);
    if (newActor.bottom > this.height){
      return 'lava';
    } else if ( (newActor.left < 0) || (newActor.right > this.width) || (newActor.top < 0) ){
      return 'wall';
    }
    let i = Math.floor(newActor.top);
    let iTo = Math.ceil(newActor.bottom);
    let j = Math.floor(newActor.left);
    let jTo = Math.ceil(newActor.right);
    for(let I = i; I < iTo; I++){
      for(let J = j; J < jTo; J++){
        if(this.grid[I][J]){
          return this.grid[I][J];
        }
      }
    }
  }
  removeActor(objectForDelete) {
    if (this.actors.indexOf(objectForDelete) !== -1) {
      this.actors.splice(this.actors.indexOf(objectForDelete), 1);
    }
  }
  noMoreActors(typeOfActor) {
    let availibility = true;
    if (this.actors) {
      for (let i = 0; i < this.actors.length; i++) {
        if (this.actors[i] !== undefined) {
            if (this.actors[i].type === typeOfActor) {
            availibility = false;
            break;
          }
        }
      }
    }  
    return availibility;
  }
  playerTouched(type, touchedObject) {
    if (this.status === null) {
      if (type === `lava` || type === `fireball`) {
        this.status = `lost`;
      } else if (type === `coin`) {
        this.removeActor(touchedObject);
        if (this.noMoreActors(`coin`)) {
          this.status = `won`;
        }
      }
    }
  }
}
class LevelParser {
  constructor (dictionary) {
    this.dictionary = dictionary;
  }
  actorFromSymbol(symb) {
    if (symb && this.dictionary) {
      if (this.dictionary[symb]) {
        return this.dictionary[symb];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  obstacleFromSymbol(symb) {
    if (symb === `x`) {
      return `wall`;
    } else if (symb === `!`) {
      return `lava`;
    } else {
      return undefined;
    }
  }
  createGrid(arr) {
    let arrOfObatcles = [];
    for (let i = 0; i < arr.length; i++) {
      arrOfObatcles[i] = arr[i].split(``);
    }
    for (let i = 0; i < arrOfObatcles.length; i++) {
      for (let j = 0; j < arrOfObatcles[i].length; j++) {
        arrOfObatcles[i][j] = this.obstacleFromSymbol(arrOfObatcles[i][j]);
      }
    }
    return arrOfObatcles;
  }
  createActors(arr) {
    let arrOfActors = [];
    for (let i = 0; i < arr.length; i++) {
      arrOfActors[i] = arr[i].split(``);
    }
    let finalArrOfActors = [];
    for (let i = 0; i < arrOfActors.length; i++) {
      for (let j = 0; j < arrOfActors[i].length; j++) {
        if (arrOfActors[i][j]) {
          let ConstructorOfActor = this.actorFromSymbol(arrOfActors[i][j]);
          if (ConstructorOfActor && typeof ConstructorOfActor === `function` && new ConstructorOfActor(new Vector(j, i)) instanceof Actor) {
            finalArrOfActors.push(new ConstructorOfActor(new Vector(j, i)));
          }
        }
      }
    }
    return finalArrOfActors;
  }
  parse(arr) {
    return new Level(this.createGrid(arr), this.createActors(arr));
  }
}
class Player extends Actor {
  constructor (position = new Vector(0, 0), size = new Vector(0.8, 1.5), speed = new Vector(0, 0)) {
    super();
    this.pos = position.plus(new Vector(0, -0.5));
    this.size = size;
    this.actor = `player`;
    }
}
class Fireball extends Actor {
  constructor (position = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(position);
    this.size = new Vector(1, 1);
    this.speed = speed;
    this.actor = `fireball`;
  }
  getNextPosition(time = 1) {
    return new Vector(this.pos.x + time*this.speed.x, this.pos.y + time*this.speed.y);
  }
  handleObstacle() {
    this.speed.x = -this.speed.x;
    this.speed.y = -this.speed.y;
  }
  act(time, level) {
    let newPosition = this.getNextPosition(time);
    if (level.obstacleAt(newPosition, this.size)){
      this.handleObstacle();
    } else {
      this.pos = newPosition;
    }
  }
}
class HorizontalFireball extends Fireball {
  constructor (position = new Vector(0, 0)) {
    super(position);
    this.speed = new Vector(2, 0);
  }
}
class VerticalFireball extends Fireball {
  constructor (position = new Vector(0, 0)) {
    super(position);
    this.speed = new Vector(0, 2);
  }
}
class FireRain extends Fireball {
  constructor (position = new Vector(0, 0)) {
    super(position);
    this.speed = new Vector(0, 3);
    this.start = position;
  }
  handleObstacle() {
    this.pos = this.start;
  }
}
class Coin extends Actor {
  constructor (position = new Vector(0, 0)) {
    super();
    this.size = new Vector(0.6, 0.6);
    this.pos = position.plus(new Vector(0.2, 0.1));
    this.actor = `coin`;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;
  }
  updateSpring(time = 1) {
    this.spring = this.spring + (this.springSpeed * time);
  }
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }
  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.pos.plus(this.getSpringVector());
  }
  act(time) {
    this.pos = this.getNextPosition(time);
  }
}
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
};
const parser = new LevelParser(actorDict);
loadLevels()
  .then((levels) => {
    let scheme;
    try{
      scheme = JSON.parse(levels);
      runGame(scheme, parser, DOMDisplay);
    } catch (err){
      console.error(err);
    }
  });