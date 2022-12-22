import axiosClient from './api/axiosClient';
import postApi from './api/postApi';
import studentApi from './api/studentApi';

async function main() {
  try {
    const queryParams = {
      _page: 1,
      _limit: 5,
    };
    const data = await studentApi.getAll(queryParams);
    console.log(data);
  } catch (error) {
    console.log(error);
  }

  await postApi.update({
    id: 'lea2aa9l7x3a5ub',
    title: 'Ipsam error 229',
  });
}

main();
