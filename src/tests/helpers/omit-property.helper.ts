
// return an object without the specified property
export function omitProperty<
    ObjectType extends object,
    ObjectKey extends keyof ObjectType
    >(obj: ObjectType, property: ObjectKey) {
    const objClone = structuredClone(obj);
    delete objClone[property];
    return objClone;
}