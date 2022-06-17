import axios from "axios"
import { showAlert } from './alert'
// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ?
      'http://localhost:3000/api/v1/users/updatePassword' :
      'http://localhost:3000/api/v1/users/updateMe'

    const res = await axios({
      method: 'PATCH',
      url,
      data
    })

    if (res.data.status === 'success')

      showAlert('success', `Your ${type.toUpperCase()} has been updated`)
    setTimeout(() => {
      location.reload(true)
    }, 0)

  }
  catch (err) {
    showAlert('error', err.response.data.message)


  }
}