const MMM = require('./index')

const AA = MMM({
    data:{
        aa:'郭成功',
        get name(){
            return `Guo~郭~ ${this.aa}`
        }
    }
})
const BB = MMM({
    data:{
        bb:'richie',
    },
    update(data){
        this.supeUpdate(data);
    }
},[AA])
const CC = MMM({
    data:{
        cc:'world',
        get richie(){
            console.log("================================================this");
            // console.log(this.name);
            console.log(this);
            return `richie is ${this.name}`
        }
    },
    sayMyName(){
        console.log(`我的名字是: ${this.aa}`);
    },
    // update(data, key2key){
    //     this.dataParse(data, key2key);
    // },
}, [BB]);

const instance = CC.New({aa:'是你妈妈啊'});
console.clear();
// console.log(":  sayMyName");
// instance.sayMyName();
// instance.update({aa:'是你爸爸'});
console.log(instance.name);
console.log(instance.richie);
