import dayjs from 'dayjs';

export function createPostElement(post) {
  if (!post) return;

  // find template and cloneNode
  const template = document.getElementById('postItemTemplate');
  const liElement = template.content.firstElementChild.cloneNode(true);
  if (!liElement) return;

  // Update title, description, author,...
  const title = liElement.querySelector('[data-id="title"]');
  if (title) title.textContent = post.title;

  const description = liElement.querySelector('[data-id="description"]');
  if (description) description.textContent = post.description;

  const author = liElement.querySelector('[data-id="author"]');
  if (author) author.textContent = post.author;

  const timeSpan = liElement.querySelector('[data-id="timeSpan"]');
  if (timeSpan) timeSpan.textContent = `- ${dayjs(post.updateAt).fromNow()}`;

  const thumbnail = liElement.querySelector('[data-id="thumbnail"]');
  if (thumbnail) {
    thumbnail.src = post.imageUrl;

    thumbnail.addEventListener('error', () => {
      thumbnail.src = 'https://picsum.photos/id/18/1368/400';
    });
  }

  // Attach event handlers
  // go to post details when click post item
  const divElement = liElement.firstElementChild;
  if (!divElement) return;
  divElement.addEventListener('click', (event) => {
    // if event is triggered from menu => ignore
    const menu = liElement.querySelector('.post-item-menu');
    if (menu && menu.contains(event.target)) return;

    window.location.assign(`/post-detail.html?id=${post.id}`);
  });

  // add click event for edit button
  const editButton = liElement.querySelector('[data-id="edit"]');
  if (editButton) {
    editButton.addEventListener('click', (e) => {
      // e.stopPropagation();
      window.location.assign(`/add-edit-post.html?id=${post.id}`);
    });
  }

  // add click event for remove button
  const removeButton = liElement.querySelector('[data-id="remove"]');
  if (removeButton) {
    removeButton.addEventListener('click', () => {
      const customEvent = new CustomEvent('post-delete', {
        bubbles: true,
        detail: post,
      });

      removeButton.dispatchEvent(customEvent);
    });
  }

  return liElement;
}

export function renderPostList(postList) {
  if (!Array.isArray(postList)) return;

  const ulElement = document.getElementById('postList');
  if (!ulElement) return;

  ulElement.textContent = '';

  postList.forEach((post) => {
    const liElement = createPostElement(post);
    ulElement.appendChild(liElement);
  });
}
