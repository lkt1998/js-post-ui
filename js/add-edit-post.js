import postApi from './api/postApi';
import { initPostForm, toast } from './utils';

function removeUnusedFields(formValues) {
  const payload = { ...formValues };
  if (payload.imageSource === 'upload') {
    delete payload.imageUrl;
  } else {
    delete payload.image;
  }
  delete payload.imageSource;

  if (payload.id === undefined) delete payload.id;

  return payload;
}

function jsonFormData(jsonFormData) {
  const formData = new FormData();

  for (const key in jsonFormData) {
    formData.set(key, jsonFormData[key]);
  }

  return formData;
}

async function handlePostFormSubmit(formValues) {
  try {
    const payload = removeUnusedFields(formValues);
    const formData = jsonFormData(payload);
    // check add/edit mode
    // S1: base on search params (check id)
    // S2: formValues.id
    // call API

    const savePost = formValues.id
      ? await postApi.updateFormData(formData)
      : await postApi.addFormData(formData);

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
