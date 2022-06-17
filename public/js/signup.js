import axios from 'axios'
import { showAlert } from './alert'
export const signup = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        confirmPassword
      }
    })

    if (res.data.status === 'success') {
      showAlert('success', 'Sign up successfully!')
      setTimeout(() => {
        location.assign('/me')
      }, 1500)

    }
  } catch (err) {
    showAlert('error', err.response.data.message)

  }
}