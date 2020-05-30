// set timer
class Item { // queue에 들어가는 
  block = null;
  time = null;
  constructor(block, time){
    this.block = block;
    this.time = time + performance.now() // performance 브라우저가 시작된 이후의 시간
  }
}

// Set를 쓰는 이유
/**
 * 배열에는 사실상 값만 담을 수 있다고 생각해야한다.
 * 하나의 배열에 똑같은 객체가 2~5번이 중복되어 들어간다면 버그
 * 배열에 똑같은 숫자가 여러번 들어가면 잘못되지 않는다.
 * 값과 참조의 차이이다. 
 * 3과 3은 똑같지만 메모리 주소는 다르다. 하지만 안의 있는 값은 같기 때문에
 * Set에 넣어햐지만 중복되지 않은 배열을 만들수 있다
 */
const queue = new Set;
// foreach 는 배열 복사본을 돌리기 때문에 삭제(delete)를 해도 원형에 영향을 끼치지 않는다.
const f = time => {
  queue.forEach(item => {
    if(item.time > time) return;
    queue.delete(item)
    item.block()
  })
  requestAnimationFrame(f)
}
requestAnimationFrame(f)

const timeout = (block, time) => queue.add(new Item(block, time))

// timeout(_ => console.log('hello'), 1000)

// Non Blocking For
// 동기와 블로킹을 시키는 코드?
const working = _ => {}
for(let i=0; i<10000; i++) working()

const nbFor = (max, load, block) => {
  let i = 0;
  const f = time => {
    let cuur = load
    while(cuur-- && i < max) {
      block()
      i++
    }
    console.log(i)
    // if(i < max - 1) requestAnimationFrame(f)
    if(i < max - 1) timeout(f, 0)
  }
  // requestAnimationFrame(f)
  if(i < max - 1) timeout(f, 0)
}

// nbFor(100, 10, working)

// Generator
/**
 * 함수처럼 호출 하면 iterable 얻을 수 있다?
 * 인터러벌, 인터레이터? 인터페이스 = 자바스크립트 고유명사
 * 특정 객체의 특정키나 큭정 값이 들어가있는 것을 인터페이스라고 불린다
 * 오브젝트의 형태를 인터페이스라고
 * 
 * 인터레이터라는 키와 함수가 있어야하고 인터레이터 함수를 반환해야한다 (자바)
 * 
 * 인터레이터에게 next 함수를 호출하면 오브젝트를 리턴하는 인터페이스를 정의한다.
 * value, done? doen은 true, false 여부로 리턴할지 정한다?
 *
 * Generator는
 * 유사 인터러벌이라고 불린다. 그냥 호출하면 인터레이터 정의를 얻을 수 있다.
 * 
 * yield 가 일어날 떄마다 넥스트 다음 턴 을 줄수 있게 된다.
 * 
 * 명령어 중간에 끊을 수 있다. 서스팬드?
 * 다시 진행은 리절브?
 * 
 * yield를 호출하면 명령이 멈춰서 무한루프가 되지 않는다.
 * 밖에서 next를 호출 하면 리절브가 발생된다.
 * 
 */
const infinity = (function * (){
  let i = 0;
  while(true) yield i++;
})()
console.log(infinity.next())


/**
 * nbFor 코드에서의 문제점은 재활용 할 수 없다..?
 * 제어문은 약간만 변형하면 재사용할 수 없다 (?)
 */
const gene = function *(max, load, block){
  let i = 0;
  let curr = load;
  while(i < max) {
    if(curr--){
      block();
      i++;
    }else{
      curr = load
      console.log(i)
      yield;
    }
  }
};


const geneNbFor = (max, load, block) => {
  const interator = gene(max, load, block)
  const f = _ => interator.next().done || timeout(f)
  timeout(f, 0)
}

// geneNbFor(300, 40, working)

/**
 * 반제어 역전
 */
const gene2 = function *(max, load, block){
  let i = 0, curr = load;
  while(i < max){
    yield new Promise(res => {
      let curr = load
      while (curr-- && i < max){
        block()
        i++
      }
      console.log(i)
      timeout(res, 0)
    })
  }
}

const geneNbFor2 = (max, load, block) => {
  const interator = gene(max, load, block)
  const next = ({value, done}) => done || value.then(v => next(interator.next()))
  next(interator.next())
}