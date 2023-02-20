import * as functions from 'firebase-functions';
import { manageUsersApp } from './manage-users';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const manageUsers = functions.https.onRequest(manageUsersApp);
