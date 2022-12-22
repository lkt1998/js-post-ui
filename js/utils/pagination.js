export function renderPagination(elementId, pagination) {
  const ulPagination = document.getElementById(elementId);
  if (!pagination || !ulPagination) return;
  // calc totalPages
  const { _page, _limit, _totalRows } = pagination;
  const totalPages = Math.ceil(_totalRows / _limit);

  // save page and totalPages to ulPagination
  ulPagination.dataset.page = _page;
  ulPagination.dataset.totalPages = totalPages;

  // check if disabled/enabled to next/prev link
  if (_page <= 1) ulPagination.firstElementChild?.classList.add('disabled');
  else ulPagination.firstElementChild?.classList.remove('disabled');

  if (_page >= totalPages) ulPagination.lastElementChild?.classList.add('disabled');
  else ulPagination.lastElementChild?.classList.remove('disabled');
}

export function initPagination({ elementId, defaultParams, onChange }) {
  // bind click  event prev/next link
  const ulPagination = document.getElementById(elementId);
  if (!ulPagination) return;

  // set current page
  // TODO use defaultParams

  // add click event prev/next link
  const prevLink = ulPagination.firstElementChild?.firstElementChild;
  if (prevLink) {
    prevLink.addEventListener('click', (e) => {
      e.preventDefault();

      const page = Number.parseInt(ulPagination.dataset.page) || 1;
      if (page <= 1) return;
      onChange?.(page - 1);
    });
  }

  const nextLink = ulPagination.lastElementChild?.lastElementChild;
  if (nextLink) {
    nextLink.addEventListener('click', (e) => {
      e.preventDefault();

      const page = Number.parseInt(ulPagination.dataset.page) || 1;
      const totalPages = ulPagination.dataset.totalPages;
      if (page >= totalPages) return;
      onChange?.(page + 1);
    });
  }
}