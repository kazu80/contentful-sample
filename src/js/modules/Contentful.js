const contentful = require("contentful");

/**
 * clientの設定を行う
 * spaceとaccessTokenを指定
 */
const client = contentful.createClient({
    space: "",
    accessToken: ""
});

/**
 * https://contentful.github.io/contentful.js/contentful/7.14.8/ContentfulClientAPI.html#.getEntry
 */
async function getEntry(entryID) {
    return await client.getEntry(entryID);
}

/**
 * https://contentful.github.io/contentful.js/contentful/7.14.8/ContentfulClientAPI.html#.getEntries
 */
async function getEntries(query) {
    const response = await client.getEntries(query);
    return response.items;
}

async function getAssets(ID, query) {
    return await client.getAsset(ID, query);
}

async function getContentTypes(query) {
    return await client.getContentTypes(query);
}

export const contentfulMethods = {getEntry, getEntries, getAssets, getContentTypes}
