import {useEffect, useMemo, useState} from "react";

const dir = Object.freeze({
    asc: 1,
    none: 0,
    desc: -1
})

function sortHandler(property, direction) {
    return function (a, b) {
        const result =
            a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
        return result * direction;
    };
}

export function useSort(data = [], direction = dir.none) {
    const [sortData, setSortData] = useState([]);
    const [sortDirection, setSortDirection] = useState(direction);
    const [sortProperty, setSortProperty] = useState(undefined);

    const sortDispatcher = (property) => {
        const newSortDirection = [dir.none, dir.desc].includes(sortDirection) ? dir.asc : dir.desc;
        const newSortedData = sortData.sort(sortHandler(property, newSortDirection));
        setSortData(newSortedData);
        setSortDirection(newSortDirection);
        if (property !== sortProperty || sortProperty === undefined) setSortProperty(property)
    }

    const isEmpty = useMemo(() => sortData.length === 0, [sortData]);

    useEffect(() => {
        setSortData(data)
    }, [data]);

    return {sortData, sortProperty, sortDirection, sortDispatcher, isEmpty}
}