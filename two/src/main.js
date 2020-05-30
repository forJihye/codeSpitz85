// 동시성 concurrency
/**
 * 마치 동시에 일어난 것 처럼
 * 프로세스를 타임으로 슬라이스로 때려서 진행한다.
 * 워커는 한명 뿐
 * 메모리를 동시에 쓰는 일이 없다.
 * 테스크를 왔다갔다 하면서 메모리를 참조하기 떄문에
 * 메모리의 씽크라이즈? 가 없다.
 */

 // 병행성, 병렬성 parallelism  
 /**
  * 수행 해야하는게 2개가 있다면 동시에 몸이 두개 몸이 되어 일을 같이 해야하는데
  * 병행성이 성립된다. 워커가 2명이어야 동시에 처리하는
  * 테스크에 할당되는 워커가 각각 존재해서 처리하는
  * 테스크가 같은 메모리를 참조하고 있다면 문제가 되는 것이다
  * 에이가 진행하는 동안 비가 접근하지 못하도록 블로킹하고
  * 비가 접근할 때는 에이를 블로킹 하고
  * 못쓰는 상황에서 어떻게 되냐? 기다린다.
  * 
  * 병행성의 어려움은 메모리를 같이 쓰는 것이다.
  */

// timer class  
const Item = class {
  block;
  time;
  constructor(block, time){
    this.block = block;
    this.time = time + performance.now() // 브라우저가 시작된 시간 이후로
  }
}

// Set를 쓰는 이유
/**
 * 배열에는 사실상 값만 담을 수 있다고 생각해야한다.
 * 하나의 배열에 똑같은 객체가 2~5번이 중복되어 들어간다면 버그
 * 배열에 똑같은 숫자가 여러번 들어가면 잘못되지 않는다.
 * 값과 참조의 차이이다. 
 * 3과 3은 똑같지만 메모리 주소는 다르다. 하지만 안의 있는 값은 같기 때문에
 * Set에 넣어햐지만 중복되지 않은 배열을 만들수 있다.
 * 
 * 객체지향프로그래밍은 Set을 쓰는 것이 맞다.
 */
const queue = new Set;
const f = time => {
  queue.forEach(item => { 
    if(item.time > time) return;
    queue.delete(item); // foreach 는 배열 복사본을 돌리기 때문에 삭제(delete)를 해도 원형에 영향을 끼치지 않는다.
    item.block();
  });
  requestAnimationFrame(f);
};
requestAnimationFrame(f);

const timeout = (block, time) => queue.add(new Item(block, time));
timeout(_ => console.log('hello'), 2000);

// Non Blocking For
// blocking 은 해당 코드의 실행 때문에 다른 코드를 실행할 수 없는 현상을 말한다. 
/**
 * nonBlockingFor 의 문제?
 * timeout 을 제외한 로직은 동기적 로직인데, ....?
 * 제어문은 재활용이 불가능하다. 한 번 실행되고 나면 메모리에서 사라진다.
 * 값으로 저장하면 메모리에 담아있다. cpu는 메모리는 재활용할 수 있다.
 * 
 * timeout을 넣으면  timeout을 만드는 함수를 만들어야 하기 때문에 재활용 할 수 없다?
 * 약간만 변형해도 복사해서 쓸 수 밖에 없다.
 * 
 */
const nonBlockingFor = (max, load, block) => {
  let i = 0;
  const f = _ => {
    let current = load;
    while(current-- && i < max){
      block();
      i++;
    }
    console.log(i)
    if(i < max-1) timeout(f, 0);
  }
  timeout(f, 0);
}
// nonBlockingFor(500, 50, _=>{});

/**
 * generator
 * 
 * 제네레이터를 호출하면 이터레이터 정의를 얻을 수 있다.
 * 써스팬드..? (멈춤) 리줌..? (다시진행)
 * yield를 호출하면 멈추고 다음번 next()를 호출해야 다시 작업
 * 
 * 제네레이터는 써스팬딩 할 수 있기 때문에 멈춰서 외부에서 제어를 할 수 있다.(next()) 밖에서 위임을 받을 수 있다.
 */
const infinity = (function*(){
  let i = 0;
  while(true) yield i++;
})();
console.log(infinity.next())
console.log(infinity.next())
console.log(infinity.next())

const gene = function*(max, load, block){
  let i = 0, current = load;
  while(i < max){
    if(current--){
      block();
      i++;
    }else{
      current = load;
      console.log(i);
      yield
    }
  }
}

const nonBlockingFor2 = (max, load, block) => {
  const iterator = gene(max, load, block);
  const f = _ => iterator.next().done || timeout(f); // 외부에서 위임되어있는 함수를 쓰는것
  timeout(f, 1000);
}
nonBlockingFor2(100, 20, _=>{});


// 비동기 제어역전은 안되기 때문에 반제어역전 promise
