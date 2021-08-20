
const KEYS = ['init','update','dataParse','supers'];
// 将property的所有字段赋给obj，并设置为只读
function DefineReadOnlyProperty(obj, prototype) {
    if (!prototype || typeof prototype != 'object') return obj;
    for (let key in prototype) {
        try {
            // total_buy_price_formate
            // 允许覆盖属性
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                delete obj[key];
            }
            if(isReadOnly(prototype, key)){
                Object.defineProperty(obj, key, isReadOnly(prototype,key));
            }else{
                Object.defineProperty(obj, key, {
                    get() { return prototype[key]; }, // 设置属性只读
                    enumerable: true, // 允许遍历
                    configurable: true, // 允许删除
                });
            }
        } catch (err) {
            console.error(err);
            console.trace();
        }
    }
    return obj;
}

// 把obj2的属性值赋予与obj1对应的属性
function SetValuesByProperties(obj1, obj2, emptyOthers) {
    if (!obj1 || typeof obj1 != 'object') return obj1;
    if (!obj2 || typeof obj2 != 'object') return obj1;
    for (let item in obj1) {
        if(KEYS.indexOf(item) > -1){
            continue;
        }
        const _inObj2 = Object.prototype.hasOwnProperty.call(obj2, item);
        try {
            if (_inObj2) {
                if(!isReadOnly(obj1, item)){
                    // *@important: 在obj1声明且在obj2中声明的属性才赋值
                    obj1[item] = obj2[item] != undefined ? obj2[item] : '';
                }else {
                    console.log(`${item} 字段是只读字段不可赋值.`);
                }
            } else if (emptyOthers && !isReadOnly(obj1, item)) {
                // *如果需要置为空
                obj1[item] = '';
            }
        } catch (err) {
            console.error(err);
            console.trace();
        }
    }
    return obj1;
}

// obj1: 数据来源 
// key: 要拷贝的字段 
// obj2: 拷贝进入此目标
function CopyProperties(obj1, key, obj2){
    const _pro = Object.getOwnPropertyDescriptor(obj1, key);
    Object.defineProperty(obj2, key, _pro);
    return obj2;
}
function isReadOnly(obj, key){
    if(!obj || !key){
        return false;
    }
    const _pro = Object.getOwnPropertyDescriptor(obj, key);
    if(_pro && _pro.get && !_pro.set){
        return _pro;
    }
    return false;
}

// *对象深拷贝
function DeepCopy(data) { // 深拷贝
    if (!data) return '';
    if (typeof data != 'object') return data;
    if (Object.keys(data).length == 0) {
        if (Array.isArray(data)) { // 如果是空数组，返回一个空数组
            return [];
        } else { // 如果是字典，返回一个空字典
            return {};
        }
    };
    let _data = {};
    if (Array.isArray(data)) { // 如果是数组
        _data = [];
        if (data.length > 0) {
            for (let key = 0; key < data.length; key++) {
                let val = data[key];
                if (typeof val == 'object') {
                    _data[key] = DeepCopy(val);
                    continue;
                }
                // _data[key] = val;
                _data = CopyProperties(data, key, _data);
            }
        }
    } else { // 如果是字典
        for (let key in data) {
            let val = data[key];
            if (typeof val == 'object') {
                _data[key] = DeepCopy(val);
                continue;
            }
            // _data[key] = val;
            _data = CopyProperties(data, key, _data);
        }
    }
    return _data;
}

function isDictionary(obj){
    if(!obj || typeof obj !== 'object'){
        return false;
    }
    if(obj.constructor === Array){
        return false;
    }
    return true;
}

function CheckKeys(data){ // 检查是否有异常字段
    if(!isDictionary(data)){
        console.error("数据模型中的data必须是对象/字典");
        return false;
    }
    const _keys = KEYS;
    const _disable_keys = [];
    for(let key in data){
        if(_keys.indexOf(key) > -1){
            _disable_keys.push(key);
        }
    }
    if(_disable_keys.length > 0){
        _msg = `数据模型中，以下字段为函数名，不用在data字段里面:${_disable_keys.join(',')}`
        console.error(_msg)
        return false;
    }else{
        return true;
    }
}

function MMM(model, super_models){
    function _OO(){
        this.supers = null;
        let superArr = null;
        let didInit = false;
        function funExtends(){
            if(super_models && super_models.length > 0){
                superArr = [];
                super_models.forEach(fun => {
                    fun.__origin.call(this);
                    superArr.push({ 
                        init: this.init,
                        dataParse: this.dataParse,
                    })
                })
            }
        }
        function superInit(data){
            if(superArr && superArr.length > 0){
                superArr.forEach((dic,index)=>{
                    dic.init.call(this, data);
                    superArr[index].update = this.update;
                })
            }
        }
        function superUpdate(data){
            if(superArr && superArr.length > 0){
                superArr.forEach(dic=>{
                    if(dic.update) dic.update.call(this, data);
                })
            }
        }
        function superDataParse(data, emptyOthers){
            if(superArr && superArr.length > 0){
                superArr.forEach(dic=>{
                    if(dic.dataParse) dic.dataParse.call(this, data, emptyOthers);
                })
            }
        }
        funExtends.call(this);
        const _data = DeepCopy(model.data);
        delete model.data;
        // 初始化数据 =======
        this.init = function(data){
            if(didInit){
                console.error("init 函数只能在构建数据模型时执行，不能手动执行.")
                return;
            }
            superInit.call(this, data);
            // 如果不是对象，直接退出
            if(CheckKeys(_data)){
                DefineReadOnlyProperty(this,_data);
                this.dataParse(data);
            }
            if(model.init) model.init.call(this,data);
            if(model.update){
                const _update = model.update;
                model.update = function(data){
                    superUpdate.call(this,data);
                    _update.call(this,data);
                }
            }
            for(let key in model){
                if(key != 'init') this[key] = model[key];
            }
            this.supers = superArr;
            didInit = true;
        }
        this.update = function(data, emptyOthers){
            this.dataParse(data, emptyOthers);
        }
        this.dataParse = function(data, emptyOthers){
            superDataParse(data, emptyOthers);
            if(isDictionary(data)){
                SetValuesByProperties(_data, data, emptyOthers);
            }
        }
    }
    return class{
        static __origin = _OO;
        constructor(data){
            const _instance = new _OO();
            _instance.init(data);
            model.data = null;
            return _instance;
        }
    }
}

module.exports = MMM;
