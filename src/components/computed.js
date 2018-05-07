export default {
  // total
  $c_showTotal() {
    return !!this.localHeaderFields.find(field => !!field.item.total);
  },
  $c_showFilters() {
    return !!this.localHeaderFields.find(field => !!field.item.filter);
  },
  $c_totals() {
    return Object.assign({}, ...this.localHeaderFields.filter(field => field.item.total).map(field => ({ [field.item.key]: this.$c_items.reduce((s, item) => s + (field.item.total.parse ? field.item.total.parse(item[field.item.key]) : item[field.item.key]), 0) })));
  },
  // search
  $c_searchableFields() {
    return this.localHeaderFields.filter(field => field.item.searchable).map(field => field.item.key);
  },
  // selected
  $c_selectedItems() {
    return this.localTableModel.selectedRows;
  },
  $c_areAllItemsSelected() { // $c_areAllItemsSelected
    return this.$c_items.length === this.localTableModel.selectedRows.length;
  },
  $c_areAllItemsSelectedOnCurrentPage() {
    /** Continue only if number of items selected is equeal or
     * greater than the number of current page items
     */
    if (!this.localTableModel.selectedRows.length ||
      this.localTableModel.selectedRows.length < this.$c_itemsCurrentPage.length) {
      return false;
    }

    /**
     * Returns TRUE if the first specified array contains all elements
     * from the second one. FALSE otherwise.
     *
     * @returns {boolean}
     */
    return this.localTableModel.selectedRows.every(value => this.$c_itemsCurrentPage.indexOf(value) >= 0);
  },
  $c_itemsCurrentPage() {
    if (!this.$c_pagesInPagination) {
      return this.$c_items;
    }
    const start = (this.currentPage - 1) * this.paginationSize;
    const end = (start - 1) + this.paginationSize;
    return this.$c_items.filter((item, i) => i >= start && i <= end);
  },
  // items
  $c_items() {
    let items = this.items;
    if (!items.length) {
      return items;
    }
    // handle sort
    if (this.sortKey && typeof items[0][this.sortField] !== 'undefined') {
      if (this.sortOrder === 'asc') {
        if (typeof items[0][this.sortField] === 'number') {
          items.sort((a, b) => a[this.sortField] - b[this.sortField]);
        } else if (typeof this.items[0][this.sortField] === 'boolean') {
          items.sort((a, b) => (a[this.sortField] === b[this.sortField])? 0 : a[this.sortField]? -1 : 1); // eslint-disable-line
        } else {
          items.sort((a, b) => a[this.sortField].localeCompare(b[this.sortField]));
        }
      } else if (typeof this.items[0][this.sortField] === 'number') {
        items.sort((a, b) => b[this.sortField] - a[this.sortField]);
      } else if (typeof this.items[0][this.sortField] === 'boolean') {
        items.sort((a, b) => (a[this.sortField] === b[this.sortField])? 0 : a[this.sortField]? 1 : -1); // eslint-disable-line
      } else {
        items.sort((a, b) => (b[this.sortField].localeCompare(a[this.sortField])));
      }
    }
    // handle search
    if (this.models.search) {
      items = items.filter((item) => {
        for (const key of this.$c_searchableFields) {
          let content = item[key];
          if (key.includes('.')) {
            content = key.split('.').reduce((acc, part) => {
              if (acc) {
                return acc[part];
              }
              return undefined;
            }, item);
          }
          if ((content || '').toString().toLowerCase().includes(this.models.search.toLowerCase())) {
            return true;
          }
        }
      });
    }
    // handle filters
    this.localHeaderFields.forEach((field) => {
      if (field.item.filter) {
        if (field.item.filter.type === 'search' && this.filterModels[field.item.key] && this.filterModels[field.item.key].length) {
          items = items.filter(item => (item[field.item.key] || '').toString().toLowerCase().includes(this.filterModels[field.item.key].toLowerCase()));
        }
      }
    });
    return items;
  },

  // pages
  $c_pages() {
    return Math.floor(this.$c_items.length / this.paginationSize) + (this.$c_items.length % this.paginationSize && 1) || 1;
  },

  $c_pagesInPagination() {
    const itemsNr = 5;
    const half = (itemsNr - 1) / 2;
    let [start, end] = [1, this.$c_pages > itemsNr ? itemsNr : this.$c_pages];
    if (this.$c_pages > itemsNr && this.currentPage > half + 1) { // more then 5 pages and current page over 3
      if (this.currentPage >= this.$c_pages - half) { // if page over last page - 2
        start = this.$c_pages - (itemsNr - 1);
        end = this.$c_pages;
      } else {
        start = this.currentPage - half;
        end = this.currentPage + half;
      }
    }
    const pages = [];
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    if (pages.length === 0) {
      return [1];
    }
    return pages;
  },

  $c_exportTable() {
    const table = {};
    this.localHeaderFields.forEach((field) => {
      if (field.item.content && field.display !== false) {
        table[field.header.content] = field.item.key;
      }
    });
    return table;
  },
  $c_shouldDisplayColumn() {
    const displayCols = [];
    this.localHeaderFields.forEach((header) => {
      const result = this.tableModel.displayColumns.find(column => column.item.key === header.item.key);
      if (result) {
        displayCols.push(true);
      } else {
        displayCols.push(false);
      }
    });
    return displayCols;
  },
  $c_shouldSelectRow() {
    const selectedRows = [];
    this.$c_itemsCurrentPage.forEach((item) => {
      const result = this.tableModel.selectedRows.find(row => row === item);
      if (result) {
        selectedRows.push(true);
      } else {
        selectedRows.push(false);
      }
    });
    return selectedRows;
  },
};
