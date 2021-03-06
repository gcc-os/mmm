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
    return nums;
}

console.log(moveZeroes([0,0,0,3,12]))
