// src/types/strapi/common.ts

export interface StrapiResponse<T> {
    data: T[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

// Specific response structure for a Single Type
export interface StrapiSingleTypeResponse<TAttributes> {
    data: StrapiDataItem<TAttributes> | null; // Single types return StrapiDataItem structure
    meta: object; // Meta for single types is usually empty or different
}

// Specific response structure for a Single Type Component (like Homepage)
// which often returns attributes directly under data
export interface StrapiComponentSingleTypeResponse<TData> {
    data: TData | null; // The data structure is directly under 'data'
    meta: object;
}


export interface StrapiDataItem<T> {
    id: number;
    attributes: T;
}

export interface StrapiRelation<T> {
    data: StrapiDataItem<T>[]; // Many relation
}

export interface StrapiSingleRelation<T> {
    data: StrapiDataItem<T> | null; // Single relation
}

// Base attributes common to most Strapi entries
export interface StrapiBaseAttributes {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}