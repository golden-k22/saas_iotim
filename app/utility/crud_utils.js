module.exports = async function createUnique(model, where, newItem) {
    // First try to find the record
    const foundItem = await model.findOne({where})
        .catch(err => {
            return {item: {}, status: 500};
        });
    if (!foundItem) {
        // Item not found, create a new one
        const item = await model.create(newItem)
            .catch(err => {
                return {item: {}, status: 500};
            });
        return {item, status: 200};
    }
    else {
        return {item: foundItem, status: 201}
    }
}

module.exports = async function updateOrCreate(model, where, newItem) {
    // First try to find the record
    const foundItem = await model.findOne({where});
    if (!foundItem) {
        // Item not found, create a new one
        const item = await model.create(newItem)
        return {item, created: true};
    }
    // Found an item, update it
    const item = await model.update(newItem, {where});
    return {item, created: false};
}

module.exports = async function addOne(model, newItem) {
    const where = newItem;
    // First try to find the record
    const foundItem = await model.findOne({where})
        .catch(err => {
            return {item: {}, status: 500};
        });
    if (!foundItem) {
        // Item not found, create a new one
        const item = await model.create(newItem)
            .catch(err => {
                return {item: {}, status: 500};
            });
        return {item, status: 200};
    }
    else {
        return {item: foundItem, status: 201}
    }
}