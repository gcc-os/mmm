
function GetValueByKey(key,data){
    if(!key || typeof data !== "object"){
        return '';
    }
    if(Object.prototype.hasOwnProperty.call(data, key)){
        return data[key];
    }
    return '';
}

function Key2key(data, dic){
    const result = data;
    for(let key in dic){
        const _p = dic[key];
        if(typeof _p !== 'object' || !_p.field){
            continue;
        }
        const _k = _p.field; // 是否设置了映射名
        result[key] = GetValueByKey(_k, data);
    }
    return result;
}

module.exports = Key2key;
