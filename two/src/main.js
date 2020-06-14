class Item {
  block;
  time;
  constructor(block, time){
    this.block = block;
    this.time = performance.now() + time
  }
}
const queue = new Set;
const f = time => {
  queue.forEach(item => {
    if(item.time > time) return;
    queue.delete(item);
    item.block();
  })
  requestAnimationFrame(f);
}
requestAnimationFrame(f);
const timeout = (block, time) => queue.add(new Item(block, time));

const infinity = (function*(){
  let i = 0;
  while(true) yield i++;
})();
//console.log(infinity.next()) 
// {value: 0, done: false}
//console.log(infinity.next()) 
// {value: 1, done: false}

const gene = function*(max, load, block){
  let i = 0, curr = load;
  while(i < max){
    if(curr--){
      block();
      i++;
    }else{
      curr=load;
      console.log(i);
      yield;
    }
  }
}

const nbFor = (max, load, block) => {
  const iterator = gene(max, load, block);
  const f = _ => iterator.next().done || timeout(f);
  timeout(f, 0);
}

// nbFor(100, 20, () => console.log('hi'));

const gene2 = function*(max, load, block){
  let i = 0;
  while(i < max){
    yield new Promise(res => {
      let curr = load;
      while(curr-- && i < max){
        block();
        i++;
      }
      console.log(i);
      timeout(res, 0);
    })
  }
}
const nbFor2 = (max, load, block) => {
  const iterator = gene2(max, load, block)
  // {value: Promise, done: false}
  const next = ({value, done}) => done || value.then(v => next(iterator.next()))
  next(iterator.next())
}

nbFor2(100, 20, () => console.log('hi'));