export default class ColumnChart {
  chartHeight = 50
  loadingClass = "column-chart_loading"
  containerBodyElement = {}

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = (data) => data
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.render();
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
    this.containerBodyElement = this.element.querySelector('[data-element="body"]');
  }

  update(data = []) {
    if (this.data.length === 0 && data.length !== 0) {
      this.element.classList.remove(this.loadingClass);
    }
    if (this.data.length !== 0 && data.length === 0) {
      this.element.classList.add(this.loadingClass);
    }
    this.data = data;
    this.containerBodyElement.innerHTML = this.getChartColumns();
  }

  destroy() {
    this.element.remove();
    this.containerBodyElement = {};
    this.data = [];
    this.label = '';
    this.link = '';
    this.value = 0;
    this.formatHeading = (data) => (data);
  }

  remove() {
    this.element.remove();
    this.containerBodyElement = {};
  }

  getColumnProps() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map(item => {
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
