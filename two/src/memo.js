// 2020-06-14 

class Item { // queue 에 들어갈 아이템
  block;
  time;
  constructor(block, time){
    this.block = block;
    this.time = time + performance.now();
  }
}

const queue = new Set;

// 이벤트 루프에서 계속 큐를 체크하는 함수
/**
 * settimeout 통해서 우리가 원하는 시간에 나오는 push을 원하지만
 * 실제로 구현해보면 pull과 똑같다. render loop 처리해주는것
 * 
 */
const f = time => {
  queue.forEach(item => {
    if(item.time > time) return;
    queue.delete(item);
    // iterable의 foreach는 배열의 복사본을 반복 돌리기 때문에 삭제해도 원래 배열에 지장이 없다.
    item.block();
  })
  requestAnimationFrame(f);
}
requestAnimationFrame(f);
// 동시성 이벤트 루프안에 또다른 이벤트 루프를 만들어 냄
// 이벤트 루프가 무엇이고 어떻게 초기화 하는지?
const timeout = (block, time) => queue.add(new Item(block, time));
timeout(() => console.log('hi'), 5000);

/**
 * blocking, non blocking 
 * 직접 제어할 수 없는 대상을 처리하는 방법에 따라 나뉜다.
 * blocking은 직접 제어할 수 없는 대상의 작업이 끝날 때 까지 제어권을 넘겨주지 않는 것이다.
 * 함수가 IO를 요청 했을 때 처리가 완료 될 때까지 아무 일도 하지 못한 채 기다린다.
 * 
 * non blocking은 blocking과 반대되는 개념이다.
 * 직접 제어할 수 없는 대상의 작업 처리 여부과 상관없이 자신의 작업을 할 수 있다.
 *  
 * non blocking은 실제로 존재하지 않고 blocking을 쪼개면 존재한다?
 * 이벤트 루프에서는 만번이지만 백번으로 끊어서 만번 실행 하겠끔
 * */
const working=_=>{}
for(let i=0; i<10000; i++) working(); 

/**
 * max = 몇번 실행할지
 * load = max 만큼 돌릴 때 원하는 카운터 만큼 쪼개는
 * block = 함수 실행
 *
 * 만번 루프를 돌면서 100번 돌면 제어권을 엔진에게 돌려준다
 * 엔진은 렌더링할 수 있고 다른 수많은 일을 할 수 있다.
 * 제어권을 주지 않으면 만번이 실행할 동안 엔진은 일을 할 수 없다.
 * 
 * 동시성을 쓰기 떄문에 제어권을 계속 쥐고 있으면 엔진은 다른일을 할 수 없다.
 * 
 */
const nbFor = (max, load, block) => {
  let i = 0;
  const f = time => {
    let curr = load;
    // curr-- 가 0이되면 false가 되니까 false가 될 때 까지 block
    // curr은 보조변수 load만큼 실행되기 위해
    while(curr-- && i < max){
      block();
      i++;
    }
    console.log(i);
    // i가  max에서 1 뺀 것 보다 작을 때는 다음에도 f를 실행할 가차기 있다.
    // if(i < max - 1) requestAnimationFrame(f);
    if(i < max - 1) timeout(f, 0);
  }
  // requestAnimationFrame(f);
  timeout(f, 0);
  // timeout == setTimeout 같은 개념으로 만든
}
nbFor(100,20,()=>console.log('hi'));

/**
 * Generator (52:20)
 * 이터러벌, 이터레이터는 인터페이스이다.
 * 인터페이스는 오브젝트의 형태이다.
 * 이터러벌 메서드을 호출 하면 이터레이터를 얻을 수 있다.
 * 이터레이터라는 메소드를 호출하면 이터레이터 객체를 얻을 수있다,
 * 이터러벌은 이터레이터를 받기 위해 쓰는 거고 이터레이더가 주인공
 * 이터레이터에게 넥스트 함수를 호출하면 오브젝트를 리턴한다.
 * value와 done 키를 갖고 있는 오브젝트를 리턴한다.
 * done에는 boolean이 들어온다. done으로 next을 할지 말지 결정
 * 
 * 제네레이터는 유사 이터러벌이라 불린다.
 * 이터러벌은 이터레이터 함수를 호출해야 이터레이터 객체를 주는데
 * 제네레이터는 호출만 해도 이터레이터를 받을 수 있다.
 * function*(){}  
 * 
 * yield 는 next의 다음턴을 줄 수 있다.
 * function*(){} 은 내부적으로 서스팬드라는 구간을 생성한다
 * 서스팬드라는 구간은 동기명령은 절대 멈출 수 없는데 제네레이터는 멈출 수 있다.
 * 명령 중간에 끊을 수 있다. 메모리에 적재할 때 명령 하나하나를 레코드라는걸로 감싸 적재해서
 * 하나 실행 할 때마다 레코드를 풀어서 실행되는데 홀딩되어있으면 실행되지 않는다.
 * 중간에 끊고 다른 일을 실행하다가 홀딩을 풀어서 실행하게끔 하는게 서스팬드
 * 
 * Suspend, Resume 
 * yield를 호출하면 써스팬드라 실행된다.
 * 멈추면 다음 next를 호출해야 재귀되어서 실행된다. => Resume
 * 그래서 무한루프로 빠지지 않고 서스팬드로 인해 빠져나온다.
 * 무한히 계속된 값이 나오는 리스트를 만들 수 있다. 
 * 무한 크기의 배열을 만들 수 있다. 명령을 중간에 끊을 수 있기 때문에
 * 
 * CPS ...?
 */
const infinity = (function*(){
  let i = 0;
  while(true) yield i++;
})();
console.log(infinity.next());

/**
 * nbFor 함수의 문제점
 * timeout 시스템적인 타임을 포함하고 있다. 그 외에는 순수한 코드이고
 * loop 도는 함수의 코드를 분리할 수 없다. 제어문의 약점
 * 재활용 할려면 값으로 바꿔야한다.
 * 문은 실행되고 나면 사라진다. 명령으로 적재된것이 문이고 값으로 저장한 것은 메모리
 * 명령은 동기로 소진하면서 진행된다. 값으로 바꾸지 않으면... 제어할 방법이 없다.
 * 제어문은 약간만 변형되도 복사해서 쓸 수 밖에 없다.
 * 
 * 제네레이터는 자기가 써스팬딩 할 수 있기 때문에
 * 네이티브 구조에 의존하지 않고 자기를 멈춰서 외부에 위임할 수있다.
 * 자기가 제어구조를 가지고 있지만 서스팬드를 걸면 
 * 외부에서 넥스트로 실행 할 수 있기 때문에 외부에서 위임 할 수 있다. 
 * 
 * 첫번쨰 차이점은 스코프(변수에 접근 할 수 있는 범위)에 있는 전역변수를 쓰는데  gene은 지역변수를 쓰고있다
 * 두번쨰는 제어구조의 마지막 처리할 프레임 건더뛰기를 코드에 내장되어 있는데
 * 인자,코드에도 없고 외부로 위임함으로써 해결한다. 
 * 
 * 제어시스템은 반제어권을 외부에 줌으로써 우리는 안에서 제어와관련된 로직을 분리할 수 있다.
 */
 const gene = function*(max, load, block){
   let i=0, curr = load;
   while(i < max){
     if(curr --){
       block();
       i++;
     }else{
       curr=load;
       console.log(i);
       yield;
     }
   }
 };

const nbFor = (max, load, block) => {
  const iterator = gene(max, load, block);
  const f=_=>iterator.next().done || timeout(f);
  timeout(f, 0);
}


/**
 * 반제어역전
 * Promise
 * 
 * 콜백 형태의 아작스를 사용하면 콜백이 언제 호출되는지 모른다.
 * 트리거를 발동 시킬 수 있지만 콜백이 언제 불러들이지 제어권이 없다.
 * 콜백 대신 포로미스를 쓰는 이유는 
 * 실제로 가장 큰 문제는 콜백을 사용되면 제어권이 없다. 콜백이 언제 호출되는지 모르기 때문에
 * 
 * 우리가 원하는 시점에 콜백이 왔으면 하는게 불가능하다.
 * 할 수 있는건 반제어이다. 트리거를 거는 시점이 0초이면 서버가 3초만에 보냈으면
 * 3초만에 아무것도 할 수 없다. 제어할 수 없다 주지 않았으니까
 * 우리가 할 수 있는건 어떤 메모리 공간에 서버가 온 걸 저장할 수만 있다면
 * 4초 있다가 5초 있다가 우리가 원할 떄 콜백을 호출 할 수 있다.
 * 이것이 프로미스 then이다. 
 *
 * 제어권을 행사할려면 프로미스 객체를 가지고 있다가 
 * 내가 원할 떼 then을 호출하면 반제어권을 가지고 있다.
 * 
 * promise.then() 은 callback과 같다.
 * a = promise / a.then 사용하면 반제어권을 얻을 수 있다.
 * 
 * gene2 함수는 똑같이 yield부분에서 promise을 보내고 있다.
 * promise로 감싸서 반제어권을 줌. promise마다 외부의 언제 then을 할지 결정권을 갖게 된다.
 * 제네레이터 제어권이 promise에게 가 있다.
 */
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
  const iterator = gene2(max, load, block);// promise를 반환
  const next = ({value, done}) => done || value.then(v => next(iterator.next()));
  next(iterator.next())
}
