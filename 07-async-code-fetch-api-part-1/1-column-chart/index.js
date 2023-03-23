import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ColumnChart {
  chartHeight = 50
  loadingClass = "column-chart_loading"
  subElements = {}
  data = []

  constructor({
    url = '',
    range: {
      from = new Date(),
      to = new Date(),
    } = {},
    label = '',
    link = '',
    value = 0,
    formatHeading = (data) => data
  } = {}) {
    this.url = url;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.from = from;
    this.to = to;
    this.render();
    this.update();
  }

  get template() {
    return `<div class="column-chart ${this.loadingClass}" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    ${this.getChartTitle()}
                </div>
                <div class="column-chart__container">
                    ${this.getChartContainer()}
                </div>
            </div>`;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove(this.loadingClass);
    }
    this.subElements = this.getSubElements();
  }

  async update(from = this.from, to = this.to) {
    try {
      this.from = from;
      this.to = to;
      const data = await this.loadData();
      this.data = Object.entries(data).map(([key, val]) => ({ dateString: key, value: val }));
      this.value = this.data.reduce((acc, item) => acc + item.value, 0);
      if (this.data.length !== 0 && this.element.classList.contains(this.loadingClass)) {
        this.element.classList.remove(this.loadingClass);
      }
      if (this.data.length === 0 && !this.element.classList.contains(this.loadingClass)) {
        this.element.classList.add(this.loadingClass);
      }
      this.subElements.header.innerHTML = this.formatHeading(this.value);
      this.subElements.body.innerHTML = this.getChartColumns();

      return data;
    } catch (err) {
      console.error(err);
    }
  }

  destroy() {
    this.element.remove();
    this.subElements = {};
    this.data = [];
    this.label = '';
    this.link = '';
    this.value = 0;
    this.formatHeading = (data) => (data);
    this.from = new Date();
    this.to = new Date();
  }

  remove() {
    this.element.remove();
    this.subElements = {};
  }

  async loadData() {
    try {
      return await fetchJson(`${BACKEND_URL}${this.url}?from=${this.from.toUTCString()}&to=${this.to.toUTCString()}`);
    } catch (err) {
      console.error(err);
    }
  }

  getSubElements() {
    const res = {};
    const elems = this.element.querySelectorAll("[data-element]");
    for (const elem of elems) {
      res[elem.dataset.element] = elem;
    }

    return res;
  }

  getColumnProps() {
    const data = this.data.map(({ value }) => value);
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getChartTitle() {
    return `
        ${this.label}
        ${this.link ? `<a href=${this.link} class="column-chart__link">View all</a>` : ''}
      `;
  }

  getChartColumns() {
    const cols = this.getColumnProps();
    return cols.map(
      ({percent, value}) => `<div style="--value: ${value}" data-tooltip=${percent}></div>`
    ).join('');
  }

  getChartContainer() {
    return `<div data-element="header" class="column-chart__header">
              ${this.formatHeading(this.value)}
            </div>
            <div data-element="body" class="column-chart__chart">
              ${this.getChartColumns()}
            </div>`;
  }
}
