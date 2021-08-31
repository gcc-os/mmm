function AA(){
    console.log("AA fn!!");
}

function moveZeroes(nums){
    console.log(nums);
    let zero_index = -1;
    for(let index = 0; index < nums.length; index++){
        const num = nums[index];
        if(zero_index == -1 && num == 0){
            zero_index = index;
        }
        if(num != 0 && zero_index != -1){
            nums[zero_index] = num;
            nums[index] = 0;
            zero_index++;
        }
    }
    console.log("测试git提交记录")
    return nums;
}
