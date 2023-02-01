import { randomNumber, setFieldValue, setTextContent } from './common.js';
import * as yup from 'yup';

const ImageSource = {
  PICSUM: 'picsum',
  UPLOAD: 'upload',
};

function setFormValue(form, formValue) {
  setFieldValue(form, '[name="title"]', formValue?.title);
  setFieldValue(form, '[name="author"]', formValue?.author);
  setFieldValue(form, '[name="description"]', formValue?.description);

  setFieldValue(form, '[name="imageUrl"]', formValue?.imageUrl); //hidden imageUrl

  const image = document.getElementById('postHeroImage');
  if (image) image.style.backgroundImage = `url("${formValue?.imageUrl}")`;
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
        'Please enter at least two words',
        (value) => value.trim().split(' ').length >= 2
      ),
    author: yup.string().required('Please enter author'),
    description: yup.string(),
    imageSource: yup
      .string()
      .required('Please enter image source')
      .oneOf([ImageSource.PICSUM, ImageSource.UPLOAD], 'Invalid image source'),
    imageUrl: yup.string().when('imageSource', {
      is: ImageSource.PICSUM,
      then: yup.string().required('Please enter random image').url('Please enter url'),
    }),
    image: yup.mixed().when('imageSource', {
      is: ImageSource.UPLOAD,
      then: yup.mixed().test('required', 'Please select an image source', (file) => !!file?.name),
    }),
  });
}

function setFieldError(form, name, error) {
  const element = form.querySelector(`[name="${name}"]`);
  if (element) {
    element.setCustomValidity(error);
    setTextContent(element.parentElement, '.invalid-feedback', error);
  }
}

async function validateFormField(form, formValues, name) {
  try {
    setFieldError(form, name, '');
    const schema = getPostSchema();
    await schema.validateAt(name, formValues);
  } catch (error) {
    setFieldError(form, name, error.message);
  }

  const field = form.querySelector(`[name="${name}"]`);
  if (field && !field.checkValidity()) {
    field.parentElement.classList.add('was-validated');
  }
}

async function validatePostForm(form, formValues) {
  try {
    // reset previous error
    ['title', 'author', 'imageUrl', 'image'].forEach((name) => setFieldError(form, name, ''));

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

function showLoading(form) {
  const button = form.querySelector('[name="submit"]');
  if (button) {
    button.disabled = true;
    button.textContent = 'Saving...';
  }
}

function hiddenLoading(form) {
  const button = form.querySelector('[name="submit"]');
  if (button) {
    button.disabled = false;
    button.textContent = 'Save';
  }
}

function initRandomImage(form) {
  const randomImage = document.getElementById('postChangeImage');
  if (!randomImage) return;

  randomImage.addEventListener('click', () => {
    const imageUrl = `https://picsum.photos/id/${randomNumber(1000)}//1368/400`;

    setFieldValue(form, '[name="imageUrl"]', imageUrl); //hidden imageUrl

    const image = document.getElementById('postHeroImage');
    if (image) {
      image.style.backgroundImage = `url(${imageUrl})`;
    }
  });
}

function renderImageSourceControl(form, selectValue) {
  const controlList = form.querySelectorAll('[data-id="imageSource"]');
  controlList.forEach((control) => {
    control.hidden = control.dataset.imageSource !== selectValue;
  });
}

function initRadioImageSource(form) {
  const radioList = form.querySelectorAll('[name="imageSource"]');
  radioList.forEach((radio) => {
    radio.addEventListener('change', (event) => renderImageSourceControl(form, event.target.value));
  });
}

function initUploadImage(form) {
  const uploadImage = form.querySelector('[name="image"]');
  if (uploadImage) {
    uploadImage.addEventListener('change', (event) => {
      // get selected image
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      // set background image
      const image = document.getElementById('postHeroImage');
      image.style.backgroundImage = `url(${imageUrl})`;

      validateFormField(
        form,
        {
          imageSource: ImageSource.UPLOAD,
          image: file,
        },
        'image'
      );
    });
  }
}

function initInputOnChange(form) {
  ['title', 'author'].forEach((name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) {
      field.addEventListener('input', (event) => {
        const newValue = event.target.value;
        validateFormField(
          form,
          {
            [name]: newValue,
          },
          name
        );
      });
    }
  });
}

export function initPostForm({ formId, defaultValues, onSubmit }) {
  const form = document.getElementById(formId);
  if (!form) return;

  let submitting = false;

  setFormValue(form, defaultValues);

  initRandomImage(form);
  initRadioImageSource(form);
  initUploadImage(form);
  initInputOnChange(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (submitting) return;

    showLoading(form);
    submitting = true;

    // get form value
    const formValues = getFormValues(form);
    formValues.id = defaultValues.id;

    // validation
    const isValid = await validatePostForm(form, formValues);
    if (isValid) await onSubmit?.(formValues);

    hiddenLoading(form);
    submitting = false;
  });
}
