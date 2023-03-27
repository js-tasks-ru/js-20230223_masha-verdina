import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  productData = {}
  baseUrl = new URL(BACKEND_URL)
  element = null
  subElements = null
  categories = null

  onUploadImage = async () => {
    this.subElements.uploadImageButton.classList.add('is-loading');
    const [file] = this.subElements.uploadImageInput.files;
    const result = await this.uploadImage(file);
    this.productData.images.push({ source: file.name, url: result.data.link });

    this.subElements.imageListContainer.innerHTML = this.getImages();
    this.subElements.uploadImageButton.classList.remove('is-loading');
  }

  onSaveProduct = async (e) => {
    e.preventDefault();
    await this.save();
  }

  constructor (productId = '') {
    this.productId = productId;
  }

  destroy() {
    this.productId = '';
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.subElements = null;
    this.productData = {};
    this.categories = null;
    this.removeEventListeners();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.subElements = null;
  }

  async render () {
    this.categories = await this.fetchCategories();
    if (this.productId) {
      await this.loadProductData();
    }
    if (this.productData.images === undefined) {
      this.productData.images = [];
    }

    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.addEventListeners();

    return this.element;
  }

  getSubElements() {
    const res = {};
    const elems = this.element.querySelectorAll("[data-element]");
    for (const elem of elems) {
      res[elem.dataset.element] = elem;
    }

    return res;
  }

  addEventListeners() {
    this.subElements.uploadImageButton.addEventListener('click', () => {
      this.subElements.uploadImageInput.click();
    });

    this.subElements.uploadImageInput.addEventListener('change', this.onUploadImage);

    this.element.querySelector('button[name="save"]').addEventListener('click', this.onSaveProduct);
  }

  removeEventListeners() {

  }

  updateDataFromForm() {
    const form = document.forms.productForm;
    const strProps = ['title', 'description', 'subcategory'];
    const numProps = ['price', 'discount', 'quantity', 'status'];
    for (let prop of strProps) {
      this.productData[prop] = escapeHtml(form[prop].value);
    }
    for (let prop of numProps) {
      this.productData[prop] = parseInt(form[prop].value);
    }
  }

  get template() {
    return `<div class="product-form">
              <form data-element="productForm" name="productForm" class="form-grid">
                <div class="form-group form-group__half_left">
                  <fieldset>
                    <label class="form-label">Название товара</label>
                    <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара" ${this.productId ? `value="${escapeHtml(this.productData.title)}"` : ''}>
                  </fieldset>
                </div>
                <div class="form-group form-group__wide">
                  <label class="form-label">Описание</label>
                  <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара">${this.productId ? escapeHtml(this.productData.description) : ''}</textarea>
                </div>
                <div class="form-group form-group__wide" data-element="sortable-list-container">
                  <label class="form-label">Фото</label>
                  <div data-element="imageListContainer">
                    ${this.getImages()}
                  </div>
                  <input type="file" accept="image/*" data-element="uploadImageInput" hidden/>
                  <button type="button" name="uploadImage" data-element="uploadImageButton" class="button-primary-outline">
                    Загрузить
                  </button>
                </div>
                <div class="form-group form-group__half_left">
                  <label class="form-label">Категория</label>
                  <select class="form-control" name="subcategory" id="subcategory">
                    ${this.getCategories()}
                  </select>
                </div>
                <div class="form-group form-group__half_left form-group__two-col">
                  <fieldset>
                    <label class="form-label">Цена ($)</label>
                    <input required="" type="number" name="price" id="price" class="form-control" placeholder="100" ${this.productId ? `value=${parseInt(this.productData.price)}` : ''}>
                  </fieldset>
                  <fieldset>
                    <label class="form-label">Скидка ($)</label>
                    <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0" ${this.productId ? `value=${parseInt(this.productData.discount)}` : ''}>
                  </fieldset>
                </div>
                <div class="form-group form-group__part-half">
                  <label class="form-label">Количество</label>
                  <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1" ${this.productId ? `value=${parseInt(this.productData.quantity)}` : ''}>
                </div>
                <div class="form-group form-group__part-half">
                  <label class="form-label">Статус</label>
                  <select class="form-control" name="status" id="status">
                    <option value="1" ${this.productId && this.productData.status === '1' ? 'selected' : ''}>Активен</option>
                    <option value="0" ${this.productId && this.productData.status === '0' ? 'selected' : ''}>Неактивен</option>
                  </select>
                </div>
                <div class="form-buttons">
                  <button type="submit" name="save" class="button-primary-outline">
                    ${this.productId ? 'Сохранить товар' : 'Добавить товар'}
                  </button>
                </div>
              </form>
            </div>`;
  }

  async save() {
    this.updateDataFromForm();
    if (this.productId) {
      const result = await this.updateProduct();
      this.element.dispatchEvent(new CustomEvent('product-updated', { detail: result }));
    } else {
      const result = await this.addProduct();
      this.productId = result.id;
      this.element.dispatchEvent(new CustomEvent('product-saved', { detail: result }));
    }
  }

  async loadProductData() {
    this.productData = (await this.fetchProductData())[0]; //assume that id is uniq?
  }

  async fetchProductData() {
    const url = new URL('api/rest/products', this.baseUrl);
    url.searchParams.append('id', this.productId);
    try {
      return (await fetchJson(url));
    } catch (err) {
      console.error(err);
    }
  }

  async fetchCategories() {
    const url = new URL('api/rest/categories', this.baseUrl);
    url.searchParams.append('_sort', 'weight');
    url.searchParams.append('_refs', 'subcategory');
    try {
      return await fetchJson(url);
    } catch (err) {
      console.error(err);
    }
  }

  async uploadImage(file) {
    const formData = new FormData();

    formData.append('image', file);

    try {
      const response = await fetch(new URL('https://api.imgur.com/3/image'), {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        referrer: ''
      });

      return await response.json();
    } catch (err) {
      console.error(err);
    }
  }

  async addProduct() {
    try {
      const response = await fetch(new URL('api/rest/products', this.baseUrl), {
        method: 'PUT',
        body: JSON.stringify(this.productData),
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      return await response.json();
    } catch (err) {
      console.error(err);
    }
  }

  async updateProduct() {
    try {
      const response = await fetch(new URL('api/rest/products', this.baseUrl), {
        method: 'PATCH',
        body: JSON.stringify(this.productData),
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      return await response.json();
    } catch (err) {
      console.error(err);
    }
  }

  getCategories() {
    return this.categories.map(({title, subcategories}) => subcategories.map(
      (subcat) => `<option value=${subcat.id} ${this.productId && this.productData.subcategory === subcat.id ? 'selected' : ''}>${escapeHtml(title)} &gt; ${escapeHtml(subcat.title)}</option>`
    )).join('');
  }

  getImages() {
    return `<ul class="sortable-list">
              ${this.productData.images.map(({ source, url }) => this.getImage(source, url)).join('')}
            </ul>`;
  }

  getImage(source, url) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
              <input type="hidden" name="url" value=${url}>
              <input type="hidden" name="source" value=${source}>
              <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src=${url}>
                <span>${source}</span>
              </span>
              <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            </li>`;
  }
}
