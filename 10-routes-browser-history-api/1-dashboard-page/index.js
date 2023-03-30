import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element = null;
  subElements = {};
  baseUrl = new URL(BACKEND_URL);

  onDateSelect = (e) => {
    const { from, to } = e.detail;

    this.bestsellersTable.loading = true;
    const { start, end, sorted: { id, order } } = this.bestsellersTable;
    const fetchTableDataUrl = this.getBestsellersUrl(from, to);
    fetchTableDataUrl.searchParams.set('_sort', id);
    fetchTableDataUrl.searchParams.set('_order', order);
    fetchTableDataUrl.searchParams.set('_start', start);
    fetchTableDataUrl.searchParams.set('_end', end);
    Promise.all([fetchJson(fetchTableDataUrl), this.ordersChart.update(from, to), this.salesChart.update(from, to), this.customersChart.update(from, to)])
      .then(([tableData]) => {
        this.bestsellersTable.addRows(tableData);
        this.bestsellersTable.loading = false;
      })
      .catch((err) => console.error(err));
  }

  constructor() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    this.rangePicker = new RangePicker({from, to});
    this.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      label: 'Orders',
      range: {
        from,
        to
      },
      link: '#'
    });
    this.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'Sales',
      range: {
        from,
        to
      },
      formatHeading: data => `$${data}`
    });
    this.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      label: 'Customers',
      range: {
        from,
        to
      },
    });

    this.bestsellersTable = new SortableTable(header, {
      url: this.getBestsellersUrl(from, to),
      isSortLocally: true,
    });

  }

  destroy() {
    this.rangePicker.destroy();
    this.ordersChart.destroy();
    this.salesChart.destroy();
    this.customersChart.destroy();
    this.bestsellersTable.destroy();
    this.element.remove();
    this.element = null;
    this.subElements = {};
  }

  remove() {
    this.element.remove();
  }

  get template() {
    return `<div class="dashboard">
              <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <!-- RangePicker component -->
                <div data-element="rangePicker"></div>
              </div>
              <div data-element="chartsRoot" class="dashboard__charts">
                <!-- column-chart components -->
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
              </div>

              <h3 class="block-title">Best sellers</h3>

              <div data-element="sortableTable">
                <!-- sortable-table component -->
              </div>
            </div>`;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.rangePicker.render();
    this.subElements.rangePicker.append(this.rangePicker.element);

    this.ordersChart.render();
    this.salesChart.render();
    this.customersChart.render();
    this.subElements.ordersChart.append(this.ordersChart.element);
    this.subElements.salesChart.append(this.salesChart.element);
    this.subElements.customersChart.append(this.customersChart.element);

    this.bestsellersTable.render();
    this.subElements.sortableTable.append(this.bestsellersTable.element);

    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll('[data-element]')) {
      subElements[subElement.dataset.element] = subElement;
    }

    return subElements;
  }

  initEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelect);
  }

  getBestsellersUrl(from, to) {
    const url = new URL('api/dashboard/bestsellers', this.baseUrl);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    return url;
  }

}
