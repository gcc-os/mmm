// 把obj2的属性值赋予与obj1对应的属性
function SetValuesByProperties(obj1, obj2, emptyOthers) {
    if (!obj1 || typeof obj1 != 'object') return obj1;
    if (!obj2 || typeof obj2 != 'object') return obj1;
    for (let item in obj1) {
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

function DefineProperty(fns){
    DefineReadOnlyProperty(this, this.$data);
    if(fns){
        for(let key in fns){
            // console.log(this);
            // console.log(fns[key]);
            if(fns[key]) this[key] = fns[key];
            // Object.defineProperty(this, key, {
            //     value: fns[key],
            // });
        }
    }
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


function SetValuesForKeys(_data, data, key2key, emptyOthers){
    if(isDictionary(data)){
        let _translate_data = data;
        if(isDictionary(key2key)){
            _translate_data = K2K(data,key2key);
        }
        SetValuesByProperties(_data, _translate_data, emptyOthers);
    }
}

function Update(data, key2key, emptyOthers){
    SetValuesForKeys(this.$data, data, key2key, emptyOthers);
}

function MMM(model, SupeClass){
    let SubClass = null;
    if(SupeClass){
        SubClass = class extends SupeClass{
            update(data){
                super.update(data);
                Update.call(this, data)
            }
            data(){
                const data = super.data();
                return Object.assign(model.data || {}, data);
            }
            $data = {}
            constructor(data){
                super(data);
                this.$data = this.data();
                delete model.data;
                DefineProperty.call(this, model);
                this.update(data);
                static let isInit = false;
                if(this.init && !isInit){
                    isInit = true;
                    this.init(data);
                }
            }
        }
    }else {
        SubClass = class {
            update(data){
                Update.call(this, data)
            }
            data(){
                return model.data;
            }
            $data = {}
            constructor(data){
                this.$data = this.data();
                delete model.data;
                DefineProperty.call(this, model);
                this.update(data);
                static let isInit = false;
                if(this.init && !isInit){
                    isInit = true;
                    this.init(data);
                }
            }
        }
    }
    return SubClass;
}

module.exports = MMM;
