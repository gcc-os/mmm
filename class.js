
function  MMM(json, classes){
    let _M = null;
    if(classes){
        _M = class Model{
            constructor(data){
                super(data);
                this.init(data);
            }
        }
    }else{
        _M = class Model{
            constructor(data){
                this.init(data);
            }
        }
    }
    _M.prototype.$data = json.data
    delete json.data
    Object.assign(_M.prototype, json)
    return _M;
}


const AA = MMM({
    data:{
        name:''
    },
    init(data){
        console.log(data);
    }
})

const aa = new AA({name:'richie'});
console.log(aa.name)
