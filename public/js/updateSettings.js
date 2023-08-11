import axios from 'axios';
import { showAlert } from './alets';

// type is 'password' or 'data'
export const updateSetting = async (data, type) => {
  try {
    const url = type === 'data' ? 'updateMe' : 'updateMyPassword';
    console.log(url);

    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/user/${url}`,

      //this data will sent to the server , it store in body of the req , [req.body]
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Update Success`);
      window.setTimeout(() => {
        location.assign('/me'); //reload home page
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
