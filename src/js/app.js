import {contentfulMethods} from './modules/Contentful'
import dayjs from "dayjs";

// Markdownのパーサー
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

// ページに表示させる件数
const limit = 5;

const init = async () => {
    await setEntries();
    await setArticle();
    await setPagination();
}

window.addEventListener('DOMContentLoaded', async function () {
    await init();
}, false)

/**
 * ページネーションを作成して、表示させる
 */
async function setPagination() {
    const articleElement = document.getElementById("pagination");

    // 全投稿を取得する
    const entries = await contentfulMethods.getEntries({
        order: '-sys.createdAt'
    });

    // 全投稿から件数を取得して、それをlimitで割って切り上げてpage数を計算する
    const maxPage = Math.ceil(entries.length / limit)

    // 現在のページを取得
    const param = getParams();
    const nowPage = param.hasOwnProperty('page') ? param.page : "1";

    const paginationElement = createPagination(nowPage, maxPage);

    articleElement.appendChild(paginationElement);
}

/**
 * ページネーションタグを生成する
 * <ul>
 *     <li><a href="/?page=1">1</a></li>
 *     ...
 * </ul>
 *
 * @param now
 * @param max
 * @return {HTMLUListElement}
 */
function createPagination(now, max) {
    const ulElement = document.createElement('ul');

    for (let i = 0; i < max; i++) {
        const page = i + 1;
        const liElement = document.createElement('li');

        // aタグを生成
        if (page.toString() === now) {
            liElement.innerText = page.toString();
        } else {
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', '/?page=' + page);
            linkElement.innerText = page.toString();

            liElement.appendChild(linkElement);
        }

        ulElement.appendChild(liElement);
    }

    return ulElement;
}

/**
 * 指定したIDで記事の情報を取得する
 * IDはURLのパラメーターに付与されていると、そのIDをもとに情報を取得する
 */
async function setArticle() {
    /**
     * URLにidが指定されている場合は、そのIDの記事情報を取得する
     * URLにidがない場合は、デフォルトのIDで記事情報を取得する
     */
    const param = getParams();
    const entryID = param.hasOwnProperty('id') ? param.id : '3mmY5SfPXyUaGqpjbNYxka';

    const article = await contentfulMethods.getEntry(entryID);

    // ページを作成する
    const articleElement = document.getElementById("article");

    // Title
    const title = articleElement.querySelector("#title");
    title.innerText = article.fields.title;

    // 更新日
    const date = articleElement.querySelector("#publish-date");
    date.innerText = dayjs(article.fields.publishDate).format('YYYY年MM月DD日');

    // 説明
    if (article.fields.description) {
        const description = articleElement.querySelector("#description");
        description.innerHTML = md.render(article.fields.description);
    }

    // 画像
    if (article.fields.image) {
        const image = articleElement.querySelector("#image");

        // imgタグの作成
        const img = document.createElement('img');
        img.setAttribute('src', article.fields.image.fields.file.url);
        img.setAttribute('alt', article.fields.image.fields.description);

        image.appendChild(img);
    }

    // 本文
    const body  = articleElement.querySelector("#body");
    body.innerHTML = md.render(article.fields.body);

    // 前の記事・次の記事
    await getNextArticle(article.sys.createdAt);
    await getPrevArticle(article.sys.createdAt);
}

/**
 * 表示している記事から、次の記事へのリンクを作成する
 *
 * @param createdAt
 */
async function getNextArticle(createdAt) {
    const entries = await contentfulMethods.getEntries({
        'sys.createdAt[gt]': createdAt,
        limit: 1,
        order: 'sys.createdAt'
    });

    // 次がない場合は何もしない
    if (entries.length === 0) {
        return;
    }

    // #nextのElementに次の記事へのリンクを設定する
    const nextElement = document.getElementById("next");
    nextElement.appendChild(createLinkElementForID(entries[0].sys.id, entries[0].fields.title));
}

/**
 * 表示している記事から、前の記事へのリンクを作成する
 *
 * @param createdAt
 */
async function getPrevArticle(createdAt) {
    const entries = await contentfulMethods.getEntries({
        'sys.createdAt[lt]': createdAt,
        limit: 1,
        order: '-sys.createdAt'
    });

    // 次がない場合は何もしない
    if (entries.length === 0) {
        return;
    }

    // #prevのElementに次の記事へのリンクを設定する
    const nextElement = document.getElementById("prev");
    nextElement.appendChild(createLinkElementForID(entries[0].sys.id, entries[0].fields.title));
}

/**
 * タグを作成する
 * <a href="/?id=xxxxx">[title]</a>
 *
 * @param ID
 * @param title
 * @return {HTMLAnchorElement}
 */
function createLinkElementForID(ID, title) {
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', '/?id=' + ID);
    linkElement.innerText = title;

    return linkElement;
}

/**
 * URLからGet Parameterを取得する
 * @return {*}
 */
function getParams () {
    return [...new URLSearchParams(location.search).entries()].reduce((obj, e) => ({...obj, [e[0]]: e[1]}), {});
}

/**
 * Contentfulから記事一覧を取得して、id=listsのタグの中に挿入する
 * @return {Promise<void>}
 */
async function setEntries() {
    // 現在のページを取得
    const param = getParams();
    const nowPage = param.hasOwnProperty('page') ? param.page : 1;

    // 現在のページからスキップする記事件数を算出する
    const skip = (nowPage - 1) * limit;

    const entries = await contentfulMethods.getEntries({
        skip,
        limit,
        order: '-sys.createdAt'
    });

    const titleListElement = createTitleListElement(entries);

    // id=listsのタグの中に挿入する
    const listElement = document.getElementById("lists");
    listElement.appendChild(titleListElement);
}

/**
 * タイトル一覧エレメントを作成する
 * <ul>
 *     <li>xxxxxxx / xxxx年xx月xx日</li>
 *     ...
 * </ul>
 *
 * @param entries
 * @return {HTMLUListElement}
 */
function createTitleListElement(entries) {
    const ulElement = document.createElement('ul');

    entries.forEach((list) => {
        const liElement = document.createElement('li');

        /**
         * aタグの作成
         * <a href="...">xxxx</a>
         */
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', '/?id=' + list.sys.id);
        linkElement.innerText = list.fields.title + ' / ' + dayjs(list.fields.publishDate).format('YYYY年MM月DD日');

        liElement.appendChild(linkElement);
        ulElement.appendChild(liElement);
    })

    return ulElement;
}
