const K2K = require('./key2key')
const KEYS = ['update','dataParse'];
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

function CheckKeys(data){ // 检查字段是否合法
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

function SetValuesForKeys(_data, data, key2key, emptyOthers){
    if(isDictionary(data)){
        let _translate_data = data;
        if(isDictionary(key2key)){
            _translate_data = K2K(data,key2key);
        }
        SetValuesByProperties(_data, _translate_data, emptyOthers);
    }
}


function FindInstance(obj, prop){
    if(prop in obj) return obj;
    if(!obj._supers_ || obj._supers_.length == 0) return null;
    for (let i = 0; i < obj._supers_.length; i++){
        const _obj = obj._supers_[i];
        const res = FindInstance(_obj, prop);
        if(res) return res;
    }
    return null;
}

function Super(){
    return new Proxy({}, {
        get(obj, key){
            // key 的范围是： 
            const curObj = FindInstance(obj, key);
            if(!curObj) return null;
            return curObj[key];
        },
        set(obj, key, value){},
    });
}

function MMM(model, super_models){
    console.log(model)
    function _OO(__supers, __model){
        const model = __model;
        const _data = DeepCopy(model.data);
        delete model.data;
        this._supers_ = null;
        let _didInit = false;
        this.update = function(data, key2key, emptyOthers){
            console.log("exeupdate")
            SetValuesForKeys(_data, data, key2key, emptyOthers);
            this.supeUpdate(data, key2key, emptyOthers);
        }
        this.dataParse = function(data, key2key, emptyOthers){
            SetValuesForKeys(_data, data, key2key, emptyOthers);
            this.supeDataParse(data, key2key, emptyOthers);
        }
        this.supeDataParse = (data, key2key, emptyOthers)=>{
            if(this._supers_ && this._supers_.length){
                this._supers_.forEach(superObj => {
                    if(superObj.dataParse) superObj.dataParse(data, key2key, emptyOthers)
                })
            }
        }
        this.supeUpdate = (data, key2key, emptyOthers)=>{
            if(this._supers_ && this._supers_.length){
                this._supers_.forEach(superObj => {
                    if(superObj.update) superObj.update(data, key2key, emptyOthers)
                })
            }
        }
        // 初始化数据 =======
        this.init = function(data, key2key){
            if(_didInit){
                console.error("constructor 函数只能在构建数据模型时执行，不能手动执行.")
                return;
            }
            _didInit = true;
            if(__supers && __supers.length){
                this._supers_ = [];
                __supers.forEach(SUP => {
                    this._supers_.push(SUP.New(data, key2key));
                })
            }
            Object.assign(this, model);
            if(CheckKeys(_data)) DefineReadOnlyProperty(this,_data);
            this.update(data, key2key);
        }
    }
    return class {
        static __supers = super_models;
        static __model = model;
        static New(data, key2key){
            const _instance = new _OO(this.__supers, this.__model);
            _instance.init(data, key2key);
            const instance = new Proxy(_instance, {
                get(obj, key){
                    const curObj = FindInstance(obj, key);
                    if(!curObj) return null;
                    return curObj[key];
                },
                set(obj, key, value){
                    const curObj = FindInstance(obj, key);
                    if(curObj){
                        curObj[key] = value;
                    }else{
                        console.log(`: ERROR =====${key}`);
                    }
                },
            });
            return instance;
        }
        constructor(data, key2key){
            const _instance = new _OO();
            _instance.constructor(data, key2key);
            return _instance;
        }
    }
}

module.exports = MMM;
