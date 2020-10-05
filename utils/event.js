let map = new Map();  

const regedit = (key, func, that) => {
  let run = true
  if(!map.has(key))
  {
    map.set(key, new Array())
  }
  for (let entry of map.entries()) {  
    console.log(entry[0], entry[1]);
    entry[1].forEach((item,index)=>{
      console.log('func, item:', func, item)
      if (func == item.func){
        console.log('key has add func', func);
        run = false
        return
      }
    })
  } 
  if(run) {
    map.get(key).push({func:func, that: that})
    console.log('event map', map);
  }
}

const unRegedit = (key, func) => {
  let run = true
  if(!map.has(key))
  {
    map.set(key, new Array())
  }
  let arr = new Array()
  console.log('before remove event map', map);
  map.get(key).forEach((item,index)=>{
    if(item.func == func) {
      map.get(key).splice(index, 1)
    }
  })
  console.log('after event map', map)
}

const notice = (key, param) =>{
  console.log('notice key:' + key, map)
  if(map.has(key)) {
    map.get(key).forEach((item,index)=>{
      console.log('item', item)
      item.func(param, item.that)
    })
  }else {
    console.log('notice does not have key:' + key);
  }
}

module.exports = {
  regedit: regedit,
  notice: notice,
  unRegedit: unRegedit
}
