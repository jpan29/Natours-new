import axios from 'axios'
import { showAlert } from './alert'

const stripe = Stripe('pk_test_51LBXAjCUmCfd0vF7SOGijh8AmaLes0EXfxugbEPLVDRXoyIBjyybCR0FVYKl2UVe3yNc3kPKk3ELCO1xqUvjAYeI00dLNTuwnX')


export const bookTour = async id => {
  try {
    const session = await axios(`http://localhost:3000/api/v1/booking/checkout-session/${id}`)
    console.log(session)
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    })
  }
  catch (err) {
    console.log(err)
    showAlert('error', err)

  }

}