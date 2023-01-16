import postApi from './api/postApi';
import { initPostForm, toast } from './utils';

async function handlePostFormSubmit(formValues) {
  try {
    // check add/edit mode
    // S1: base on search params (check id)
    // S2: formValues.id
    // call API

    const savePost = formValues.id
      ? await postApi.update(formValues)
      : await postApi.add(formValues);

    // show message success
    toast.success('Save post successfully');
    // redirect to detail page
    setTimeout(() => {
      window.location.assign(`/post-detail.html?id=${savePost.id}`);
    }, 2000);
  } catch (error) {
    console.log('failed to save post', error);
    toast.error(`error: ${error.message}`);
  }
}

(async () => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const postId = searchParams.get('id');

    let defaultValues = {
      title: '',
      description: '',
      author: '',
      imageUrl: '',
    };

    if (postId) {
      defaultValues = await postApi.getById(postId);
    }

    initPostForm({
      formId: 'postForm',
      defaultValues,
      onSubmit: (formValues) => handlePostFormSubmit(formValues),
    });
  } catch (error) {
    console.log(error);
  }
})();
