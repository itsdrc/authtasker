
/* Custom utility type for exact match. If excluding all properties from both 
results in "never", it means they have the same shape */
export type Exact<T, U> = T extends U ?
    (Exclude<keyof T, keyof U> extends never ? T : never) : never;