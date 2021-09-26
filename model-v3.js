const MMM = require('./index-v3')

const AA = MMM({
    data:{
        name:'richie'
    },
    day(){
        console.log("say!!!");
    },
    init(data){
        console.log("AA == init");
    },
    test(){
        console.log("AA test");
    },
})
const BB = MMM({
    data:{
        age:'30',
        get who(){
            return `${this.name} - ${this.age}`
        }
    },
    test(){
        super.test();
        console.log("BB test");
    },
    init(data){
        console.log("BB == init");
        this.test();
    },
}, AA)

const bb = new BB({name:'guo',age:'99'});
bb.init();
console.log(bb.$data);
console.log(bb.who);

