import * as functions from 'firebase-functions';
import { manageUsersApp } from './manage-users';

export const manageUsers = functions.https.onRequest(manageUsersApp);
