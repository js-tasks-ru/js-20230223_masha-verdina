class Tooltip {
  onPointerover = (e) => {
    const { tooltip } = e.target.dataset;
    if (tooltip) {
      const shift = 5;
      this.element.style.left = `${e.clientX + shift}px`;
      this.element.style.top = `${e.clientY + shift}px`;
      this.render(tooltip);
      document.addEventListener('pointermove', this.onPointermove);
    }
  }

  onPointermove = (e) => {
    const shift = 5;
    this.element.style.left = `${e.clientX + shift}px`;
    this.element.style.top = `${e.clientY + shift}px`;
  }

  onPointerout = (e) => {
    this.element.textContent = '';
    this.remove();
    document.removeEventListener('pointermove', this.onPointermove);
  }

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.removeEventListeners();
    Tooltip.instance = null;
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

    this.removeEventListeners();
    this.addEventListeners();
  }

  addEventListeners () {
    document.addEventListener('pointerover', this.onPointerover, { capture: true });
    document.addEventListener('pointerout', this.onPointerout, { capture: true });
  }

  removeEventListeners () {
    document.removeEventListener('pointerover', this.onPointerover);
    document.removeEventListener('pointerout', this.onPointerout);
  }
}

export default Tooltip;
