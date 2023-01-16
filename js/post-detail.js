import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import postApi from './api/postApi.js';
import { setTextContent } from './utils';

function renderPostDetails(post) {
  if (!post) return;

  setTextContent(document, '#postDetailTitle', post.title);

  setTextContent(document, '#postDetailDescription', post.description);
  document.getElementById('postDetailDescription').style.fontStyle = 'italic';

  setTextContent(document, '#postDetailAuthor', post.author);

  setTextContent(
    document,
    '#postDetailTimeSpan',
    dayjs(post.updateAt).format('- DD/MM/YYYY HH:mm')
  );

  // render hero image
  const heroImage = document.getElementById('postHeroImage');
  if (heroImage) {
    heroImage.style.backgroundImage = `url('${post.imageUrl}')`;

    heroImage.addEventListener('error', () => {
      heroImage.style.backgroundImage = "url('https://picsum.photos/id/18/1368/400')";
    });
  }

  // render edit page link
  const editPageLink = document.getElementById('goToEditPageLink');
  if (editPageLink) {
    editPageLink.href = `/add-edit-post.html?id=${post.id}`;
    editPageLink.innerHTML = `<i class="fas fa-edit"></i>Edit Post`;
  }
}

(async () => {
  // get post id from url
  // fetch api detail API
  // render post details
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const postId = searchParams.get('id');
    if (!postId) return;

    const post = await postApi.getById(postId);
    renderPostDetails(post);
  } catch (error) {
    console.log(error);
  }
})();
