const MMM = require('./index')

const BB = MMM({
    data: {
        address:"shanghai",
    },
})

const CC = MMM({
    data: {
        ccc:"8089",
    },
})


const AA = MMM({
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
},[BB,CC])

const aa = new AA({name:12, age:12, height:13, address:"河南ZZ安徽阜阳", ccc:"九龙岛"});
aa.update({name:'MMMM'})
aa.sayMyAddress()
console.log(`我的名字是: ${aa.name}`);

