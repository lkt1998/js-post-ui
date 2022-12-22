import debounce from 'lodash.debounce';

export function initSearch({ elementId, defaultParams, onChange, onChangePage }) {
  const searchInput = document.getElementById(elementId);
  if (!searchInput) return;

  if (defaultParams.get('title_like')) searchInput.value = defaultParams.get('title_like');

  // set default values from query params
  const debounceSearch = debounce((event) => {
    onChange?.(event.target.value);
  }, 500);
  searchInput.addEventListener('input', debounceSearch);
}
