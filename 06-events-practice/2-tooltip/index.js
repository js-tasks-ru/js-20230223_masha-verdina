class Tooltip {
  trackedElements = [];
  onPointerover = (e) => {
    const { tooltip } = e.currentTarget.dataset;
    this.element.style.left = `${e.clientX + 5}px`;
    this.element.style.top = `${e.clientY + 5}px`;
    this.render(tooltip);
    e.currentTarget.addEventListener('pointermove', this.onPointermove);
  }

  onPointermove = (e) => {
    this.element.style.left = `${e.clientX + 5}px`;
    this.element.style.top = `${e.clientY + 5}px`;
  }

  onPointerout = (e) => {
    this.element.textContent = '';
    this.remove();
    e.currentTarget.removeEventListener('pointermove', this.onPointermove);
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  destroy() {
    Tooltip.instance = null;
    this.trackedElements = [];
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  get template() {
    return `<div class="tooltip"></div>`;
  }

  render(text = '') {
    this.element.textContent = text;
    document.body.append(this.element);
  }

  initialize () {
    if (!this.element) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.template;
      this.element = wrapper.firstElementChild;
      document.body.append(this.element);
    }

    if (this.trackedElements.length) {
      this.removeEventListeners();
    }
    this.trackedElements = document.querySelectorAll("[data-tooltip]");
    this.addEventListeners();
  }

  addEventListeners () {
    for (const elem of this.trackedElements) {
      elem.addEventListener('pointerover', this.onPointerover, { capture: true });
      elem.addEventListener('pointerout', this.onPointerout, { capture: true });
    }
  }

  removeEventListeners () {
    for (const elem of this.trackedElements) {
      elem.removeEventListener('pointerover', this.onPointerover);
      elem.removeEventListener('pointerout', this.onPointerout);
    }
  }
}

export default Tooltip;
