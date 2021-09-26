const {
    isReadOnly,
    isDictionary,
    DefineProperty,
    DefineReadOnlyProperty,
    SetValuesForKeys,
    SetValuesByProperties,
    Update
} = require('./lib/index')

function MergeData(data, _data){
    return Object.assign(data || {}, _data || {});
}

function MergeData(data, _data){
    return Object.assign(data || {}, _data || {});
}

class AA{
    data(){
        return {name:"richie"};
    }
}

class BB extends AA{
    data(){
        return MergeData(super.data(), {age:30})
    }
    constructor(data){
        super();
        DefineProperty(this);
    }
}

const bb = new BB();

console.log(bb);
console.log(bb.name);
