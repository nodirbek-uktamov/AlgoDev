function searchFilter(searchValue, list, searchBy) {
    if (!searchBy) return;

    let lowerCaseQuery = searchValue.toLowerCase().replace(/[\W\d_]/g, '')

    return searchValue
        ? list.filter((x) => searchBy(x).toLowerCase().replace(/[\W\d_]/g, '').includes(lowerCaseQuery))
        : list;
}

export function renderOptions(value = '', options, enableSearch, searchBy) {
    if (enableSearch) return searchFilter(value, options, searchBy);

    return options;
}
