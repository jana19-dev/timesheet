import { initializeApp } from "firebase/app"
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCkKOnb3xyGDtGqYt_zunBeKohc9i-kFf4",
  authDomain: "timesheet-00.firebaseapp.com",
  projectId: "timesheet-00"
}

initializeApp(firebaseConfig)

const db = getFirestore()

export {
  db
}
