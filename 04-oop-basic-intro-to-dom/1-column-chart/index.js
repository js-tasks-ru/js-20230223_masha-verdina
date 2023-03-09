export default class ColumnChart {
  _chartHeight = 50

  get chartHeight() {
    return this._chartHeight;
  }

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = (data) => data
  } = {}) {
    this._data = data;
    this._label = label;
    this._link = link;
    this._value = value;
    this._formatHeading = formatHeading;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = ` <div class="column-chart ${this._getChartMods()}" style="--chart-height: ${this._chartHeight}">
                            ${this._getChartTitle()}
                            ${this._getChartContainer()}
                          </div>`;

    this.element = wrapper.firstElementChild;
  }

  update(data = []) {
    this._data = data;
    this.render();
  }

  destroy() {
    this.element.remove();
    this._data = [];
    this._label = '';
    this._link = '';
    this._value = 0;
    this._formatHeading = (data) => (data);
  }

  remove() {
    this.element.remove();
  }

  _getColumnProps() {
    const maxValue = Math.max(...this._data);
    const scale = this._chartHeight / maxValue;

    return this._data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  _getChartMods() {
    return this._data.length === 0 ? " column-chart_loading" : "";
  }

  _getChartTitle() {
    return `<div class="column-chart__title">
        ${this._label}
        ${this._link ? `<a href=${this._link} class="column-chart__link">View all</a>` : ''}
      </div>`;
  }

  _getChartColumns() {
    const cols = this._getColumnProps();
    return cols.map(
      ({percent, value}) => `<div style="--value: ${value}" data-tooltip=${percent}></div>`
    ).join('');
  }

  _getChartContainer() {
    return `<div class="column-chart__container">
              <div data-element="header" class="column-chart__header">
                ${this._formatHeading(this._value)}
              </div>
              <div data-element="body" class="column-chart__chart">
                ${this._getChartColumns()}
              </div>
            </div>`;
  }
}
