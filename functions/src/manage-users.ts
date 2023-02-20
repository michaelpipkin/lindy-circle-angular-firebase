import { auth } from './init';
//import * as firebase from 'firebase/auth';
//import * as functions from 'firebase-functions';
import express = require('express');
import bodyParser = require('body-parser');
import cors = require('cors');

export const manageUsersApp = express();
manageUsersApp.use(bodyParser.json());
manageUsersApp.use(cors({ origin: true }));

manageUsersApp.get('/', async (req, res) => {
  let users: any = [];
  try {
    await auth.listUsers().then((userRecords: any) => {
      userRecords.users.forEach((user: any) => {
        users.push(user);
      });
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Could not retrieve users.' });
  }
});

manageUsersApp.post('/:uid', async (req, res) => {
  try {
    const admin = req.body.admin;
    await auth.setCustomUserClaims(req.params.uid, { admin: admin });
    res.status(200).json({ message: 'User role updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not update user role.' });
  }
});
