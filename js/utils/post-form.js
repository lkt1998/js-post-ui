import { setFieldValue, setTextContent } from './common.js';
import * as yup from 'yup';

function setFormValue(form, formValue) {
  setFieldValue(form, '[name="title"]', formValue?.title);
  setFieldValue(form, '[name="author"]', formValue?.author);
  setFieldValue(form, '[name="description"]', formValue?.description);

  setFieldValue(form, '[name="imageUrl"]', formValue?.imageUrl); //hidden imageUrl

  const image = document.getElementById('postHeroImage');
  if (image) {
    image.style.backgroundImage = `url("${formValue?.imageUrl}")`;

    image.addEventListener('error', () => {
      image.style.backgroundImage = 'url("https://picsum.photos/id/18/1368/400")';
    });
  }
}

function getFormValues(form) {
  const values = {};

  // S1: query each input and add value to values
  // ['title', 'description', 'author', 'imageUrl'].forEach((name) => {
  //   const field = form.querySelector(`[name="${name}"]`);
  //   if (field) values[name] = field.value;
  // });

  // S2: using formData
  const data = new FormData(form);
  for (const [key, value] of data) {
    values[key] = value;
  }

  return values;
}

function getPostSchema() {
  return yup.object().shape({
    title: yup
      .string()
      .required('Please enter title')
      .test(
        'at-least-three-words',
        'Please enter at least three words',
        (value) => value.trim().split(' ').length >= 3
      ),
    author: yup.string().required('Please enter author'),
    description: yup.string(),
  });
}

function setFieldError(form, name, error) {
  const element = form.querySelector(`[name="${name}"]`);
  if (element) {
    element.setCustomValidity(error);
    setTextContent(element.parentElement, '.invalid-feedback', error);
  }
}

async function validatePostForm(form, formValues) {
  try {
    // reset previous error
    ['title', 'author'].forEach((name) => setFieldError(form, name, ''));

    const schema = getPostSchema();
    await schema.validate(formValues, { abortEarly: false });
  } catch (error) {
    const errorLog = {};

    if (error.name === 'ValidationError' && Array.isArray(error.inner)) {
      for (const validationError of error.inner) {
        const name = validationError.path;

        // ignore if the field is already logged
        if (errorLog[name]) continue;

        setFieldError(form, name, validationError.message);
        errorLog[name] = true;
      }
    }
  }

  // add was-validated class to form element
  const isValid = form.checkValidity();
  if (!isValid) form.classList.add('was-validated');
  return isValid;
}

export function initPostForm({ formId, defaultValues, onSubmit }) {
  const form = document.getElementById(formId);
  if (!form) return;

  setFormValue(form, defaultValues);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    // get form value
    const formValues = getFormValues(form);
    formValues.id = defaultValues.id;

    // validation
    const isValid = await validatePostForm(form, formValues);
    if (!isValid) return;

    onSubmit?.(formValues);
  });
}
