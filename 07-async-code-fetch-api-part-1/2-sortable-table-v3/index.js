import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class SortableTable {
  subElements = {}
  data = []
  loadedRows = 0
  chunkSize = 30

  onHeaderPointerdown = (e) => {
    const elem = e.target.closest('[data-sortable="true"]');
    if (elem) {
      const { id } = elem.dataset;
      this.sort(id, this.reverseSortOrder(this.order));
    }
  }

  onWindowScroll = (e) => {
    const windowBottom = document.documentElement.getBoundingClientRect().bottom;
    const clientHeight = document.documentElement.clientHeight;
    const epsilon = 20;

    if (windowBottom < clientHeight + epsilon) {
      this.loadChunk();
    }
  }

  constructor(headerConfig = [], {
    url = '',
    isSortLocally = false,
    sorted: {
      id = headerConfig.find(item => item.sortable).id,
      order = 'asc',
    } = {}
  } = {}) {
    this.headerConfig = headerConfig;
    this.order = order;
    this.id = id;
    this.isSortLocally = isSortLocally;
    this.url = url;

    this.render();
    this.addEventListeners();
  }

  destroy() {
    this.removeEventListeners();
    this.headerConfig = [];
    this.data = [];
    this.subElements = {};
    this.order = 'asc';
    this.id = '';
    this.loadedRows = 0;
    this.chunkSize = 30;
    this.element.remove();
  }

  get template() {
    return `<div data-element="productsContainer" class="products-list__container">
                <div class="sortable-table">
                    <div data-element="header" class="sortable-table__header sortable-table__row">
                        ${this.getHeaderElements()}
                    </div>
                    <div data-element="body" class="sortable-table__body">
                        ${this.getBodyElements()}
                    </div>
                </div>
            </div>`;
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    this.subElements = this.getTableDataElements();

    try {
      if (this.isSortLocally) {
        this.data = await this.loadData();
      } else {
        await this.sort();
      }
      this.loadedRows += this.chunkSize;
    } catch (err) {
      console.error(err);
    }
  }

  async loadChunk() {
    try {
      const data = await this.loadData(this.id, this.order, this.loadedRows, this.loadedRows + this.chunkSize);
      if (data.length !== 0) {
        this.loadedRows += this.chunkSize;
        this.data.push(...data);

        this.subElements.body.innerHTML = this.getBodyElements();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async loadData(sortId = this.id, order = this.order, start = this.loadedRows, end = this.loadedRows + this.chunkSize) {
    const url = `${BACKEND_URL}${this.url}?_sort=${sortId}&_order=${order}&_start=${start}&_end=${end}`;
    try {
      return await fetchJson(url);
    } catch (err) {
      console.error(`Error on fetching ${url}: ${err}`);
    }
  }

  async sort(id = this.id, order = this.order) {
    this.id = id;
    this.order = order;

    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      await this.sortOnServer(id, order);
    }

    this.updateSubElementsOnSort();
  }

  sortOnClient(id, order) {
    return this.sortData();
  }

  async sortOnServer (id, order) {
    try {
      this.loadedRows = 0;
      this.data = await this.loadData(id, order);
      return this.data;
    } catch (err) {
      console.error(err);
    }
  }

  updateSubElementsOnSort() {
    const newSortByHeaderNode = [...this.subElements.header.children].find((node) => node.dataset.id === this.id);
    if (newSortByHeaderNode) {
      newSortByHeaderNode.setAttribute('data-order', this.order);
      newSortByHeaderNode.append(this.subElements.arrow);
    }

    this.subElements.body.innerHTML = this.getBodyElements();
  }


  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onHeaderPointerdown);
    window.addEventListener('scroll', this.onWindowScroll);
  }

  removeEventListeners() {
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  getTableDataElements() {
    const res = {};
    const elems = this.element.querySelectorAll("[data-element]");
    for (const elem of elems) {
      res[elem.dataset.element] = elem;
    }

    return res;
  }

  sortData() {
    const { sortType, id } = this.headerConfig.find(({id}) => id === this.id) || {};
    const order = this.order === 'desc' ? -1 : 1;
    switch (sortType) {
    case 'number':
      this.data.sort((a, b) => order * (a[id] - b[id]));
      break;
    case 'string':
      this.data.sort((a, b) => order * a[id].localeCompare(b[id], ['ru', 'en'], { usage: 'sort', caseFirst: 'upper' }));
      break;
    default:
    }
    //TODO: support custom sorting?
    return this.data;
  }

  reverseSortOrder(order) {
    return order === 'asc' ? 'desc' : 'asc';
  }

  // --------------------------- internal templates ----------------------------------
  getHeaderElements() {
    return this.headerConfig.map(
      ({id, title, sortable}) => (
        `<div class="sortable-table__cell" data-id=${id} data-sortable=${sortable} data-order=${this.order}>
            <span>${title}</span>
            ${id === this.id ? this.getArrowElement() : ''}
         </div>`
      )
    ).join('');
  }

  getBodyElements() {
    return this.data.map(
      (row) => (
        `<a href="/products/${row.id}" class="sortable-table__row">
            ${this.getRowElements(row)}
         </a>`
      )
    ).join('');
  }

  getRowElements(rowData) {
    return this.headerConfig.map(
      ({id, template}) => (
        template ? template(rowData[id]) : `<div class="sortable-table__cell">${rowData[id]}</div>`
      )
    ).join('');
  }

  getArrowElement() {
    return `<span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
           </span>`;
  }
}
