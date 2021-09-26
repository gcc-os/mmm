const MMM = require('./index-v3')
console.log(MMM)

const AA = MMM({
    init(){
        // console.group("AA 初始化init")
    },
    data: {
        address:"shanghai",
    },
    getMyKey(){
        console.log("aa 没有 key")
        console.log(this.name)
    },
    update(data){
        console.log("AA update")
        console.log(this);
    },
})

const BB = MMM({
    init(){
        // console.group("BB 初始化init")
    },
    data: {
        ccc:"8089",
    },
    update(data){
        console.log("BB update");
        this.dataParse(data);
        // this.superUpdate(data);
    }
},[AA])

const CC = MMM({
    init(){
        // console.group("CC 初始化init")
    },
    data: {
        name:"2",
        age:"",
        height:"",
        get home(){
            return `我的家乡是:${this.address}`
        }
    },
    sayMyAddress(){
        console.log(this.home);
    },
    update(data){
        console.log("复写的data函数")
        this.dataParse(data)
        // this.superUpdate(data);
        console.log(data)
    },
}, [BB])

const data = {
    nickname:'郭成成', 
    age:12, 
    height:13, 
    address:"河南ZZ安徽阜阳", 
    aaa:"九龙岛"
};

const k2k = {
    name:{
        field:"nickname"
    }
}

const cc = CC.New(data, k2k);
cc.sayMyAddress()
cc.update({address:'123456'})
cc.sayMyAddress()
console.log("我的名字是: ",cc.name);
cc.getMyKey()
