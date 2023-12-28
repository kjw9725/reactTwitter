// utils.js
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../routes/firebase';
import { FirebaseError } from 'firebase/app';

// 이메일 중복체크
export const isEmailDuplicated = async (email: string) => {
  try {
    const createUser = await createUserWithEmailAndPassword(
      auth,
      email,
      'someDummyPassword',
    );
    if (createUser) {
      auth.currentUser
        ?.delete()
        .then(() => {
          console.log('create and delete', email);
          return false;
        })
        .catch((error) => {
          console.log('deleteError', error);
        });
    }
  } catch (error: unknown) {
    if ((error as FirebaseError)?.code) {
      // If the error code is 'auth/email-already-in-use', the email is duplicated.
      return true;
    } else {
      // Handle other errors if needed`
      console.error('Error checking for duplicate email:', error);
      return false;
    }
  }
};
