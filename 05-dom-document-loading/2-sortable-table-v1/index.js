export default class SortableTable {
  subElements = {}
  sortOrder = 'asc'
  sortField = ''

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  destroy() {
    this.headerConfig = [];
    this.data = [];
    this.subElements = {};
    this.sortOrder = 'asc';
    this.sortField = '';
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
                    ${this.getArrowElement()}
                </div>
            </div>`;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    this.subElements = this.getTableDataElements();
    this.subElements.arrow.remove(); // feels bad from the readability point of view, good for performance?
  }

  sort(sortField, sortOrder) {
    if (this.sortField) {
      this.subElements.arrow.remove();
      const sortByHeaderNode = [...this.subElements.header.children].find((node) => node.dataset.id === this.sortField);
      if (sortByHeaderNode) {
        sortByHeaderNode.removeAttribute('data-order');
      }
    }

    this.sortField = sortField;
    this.sortOrder = sortOrder;

    const newSortByHeaderNode = [...this.subElements.header.children].find((node) => node.dataset.id === this.sortField);
    if (newSortByHeaderNode) {
      newSortByHeaderNode.setAttribute('data-order', this.sortOrder);
      newSortByHeaderNode.append(this.subElements.arrow);
    }

    this.sortData();
    this.subElements.body.innerHTML = this.getBodyElements();
  }

  // -------------------- kind of protected??? -----------------------------------
  getTableDataElements() {
    const res = {};
    const elems = this.element.querySelectorAll("[data-element]");
    for (const elem of elems) {
      res[elem.dataset.element] = elem;
    }

    return res;
  }

  sortData() {
    const { sortType, id } = this.headerConfig.find(({id}) => id === this.sortField) || {};
    const order = this.sortOrder === 'desc' ? -1 : 1;
    switch (sortType) {
    case 'number':
      this.data.sort((a, b) => order * (a[id] - b[id]));
      break;
    case 'string':
      this.data.sort((a, b) => order * a[id].localeCompare(b[id], ['ru', 'en'], { usage: 'sort', caseFirst: 'upper' }));
      break;
    default:
    }
  }

  // --------------------------- internal templates ----------------------------------
  getHeaderElements() {
    return this.headerConfig.map(
      ({id, title, sortable}) => (
        `<div class="sortable-table__cell" data-id=${id} data-sortable=${sortable}>
            <span>${title}</span>
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

