exports.getAllTodoOptions = (options, user)=>{
    let option = {
        user: user.toString()
    };
    if(options) option.state = { $ne: options };
    return option;
};

exports.sortSelect = (sort)=>{
    let sortBy = "";
    if(sort === 'createAt' || sort === "-createAt"){ 
        sortBy = sort ;
    }else{ sortBy = '-createAt' };
    return sortBy;
};

exports.paginate = (page, limit)=>{
    page = page * 1 || 1;
    limit = limit * 1 || 100;
    skip = (page - 1) * limit;
    return {
        skip,
        limit 
    }
};

exports.filterData = (object, ...fields)=>{
    let newObject = {};
    Object.keys(object).forEach(el => {
        if(fields.includes(el)) newObject[el] = object[el];
    });
    return newObject;
}