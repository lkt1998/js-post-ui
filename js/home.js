import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import postApi from './api/postApi';
import { initPagination, initSearch, renderPagination, renderPostList, toast } from './utils';

// to use fromNow function
dayjs.extend(relativeTime);

async function handleFilterChange(filterName, filterValue) {
  try {
    const url = new URL(window.location);
    if (filterName) url.searchParams.set(filterName, filterValue);

    // Update query param
    if (filterName === 'title_like') url.searchParams.set('_page', 1);
    history.pushState({}, '', url);

    // fetch api
    // render new post list
    const { data, pagination } = await postApi.getAll(url.searchParams);
    renderPagination('postsPagination', pagination);
    renderPostList(data);
  } catch (error) {
    console.log('fail to render postList', error);
  }
}

function setDefaultQueryParams() {
  const url = new URL(window.location);
  if (!url.searchParams.get('_page')) url.searchParams.set('_page', 1);
  if (!url.searchParams.get('_limit')) url.searchParams.set('_limit', 6);

  // Update query param
  history.pushState({}, '', url);
  return url.searchParams;
}

function registerPostDelete() {
  document.addEventListener('post-delete', async (event) => {
    try {
      const post = event.detail;
      const message = `Are you sure you want to delete post ${post.title}?`;
      if (window.confirm(message)) {
        await postApi.remove(post.id);
        await handleFilterChange();
      }
      toast.success('Remove post successfully');
    } catch (error) {
      console.log('fail to register postDelete', error);
    }
  });
}

(async () => {
  try {
    // set default query param if not existed
    // const queryParams = new URLSearchParams(window.location.search);
    const queryParams = setDefaultQueryParams();
    const { data, pagination } = await postApi.getAll(queryParams);

    // attach click event link
    initPagination({
      elementId: 'postsPagination',
      defaultParams: queryParams,
      onChange: (page) => handleFilterChange('_page', page),
    });

    initSearch({
      elementId: 'inputSearch',
      defaultParams: queryParams,
      onChange: (value) => handleFilterChange('title_like', value),
    });

    registerPostDelete();

    // render post list based URL param
    renderPagination('postsPagination', pagination);
    renderPostList(data);
  } catch (error) {
    console.log('get all error', error);
  }
})();
