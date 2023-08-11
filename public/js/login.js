import axios from 'axios';
import '@babel/polyfill';
import { showAlert } from './alets';

export const login = async (email, password) => {
  try {
    // send the data to server
    const res = await axios({
      method: 'POST',
      url: '/api/v1/user/login',
      data: {
        email,
        password,
      },
    });

    //check it is success
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/'); //reload home page
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/user/logout',
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

// const loginForm = document.querySelector('.form');
// //***loging
// if (loginForm) {
//   loginForm.addEventListener('submit', (e) => {
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     console.log(email, password);
//     e.preventDefault();
//     login(email, password);
//   });
// }
