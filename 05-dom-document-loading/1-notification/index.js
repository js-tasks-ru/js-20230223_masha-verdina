export default class NotificationMessage {
  static timerId = null
  static element = {}

  constructor(
    msg = '',
    {
      duration = 0,
      type = 'success'
    } = {}
  ) {
    this.msg = msg;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  destroy() {
    this.msg = '';
    this.duration = 0;
    this.type = 'success';
    this.element.remove();
  }

  get template() {
    return `<div class="notification ${this.type}" style="--value:${this.duration}ms">
              <div class="timer"></div>
              <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                  ${this.msg}
                </div>
              </div>
            </div>`;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
  }

  show(container = document.body) {
    if (NotificationMessage.timerId) {
      NotificationMessage.element.remove();
      NotificationMessage.element = {};
      clearTimeout(NotificationMessage.timerId);
      NotificationMessage.timerId = null;
    }
    NotificationMessage.element = this.element;
    container.append(NotificationMessage.element);

    NotificationMessage.timerId = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    if (NotificationMessage.timerId) {
      this.element.remove();
      NotificationMessage.timerId = null;
    }
  }
}
