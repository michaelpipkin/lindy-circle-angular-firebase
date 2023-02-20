import { getUserCredentialsMiddleware } from './auth.middleware';
import { auth } from './init';
import express = require('express');
import bodyParser = require('body-parser');
import cors = require('cors');

export const manageUsersApp = express();
manageUsersApp.use(bodyParser.json());
manageUsersApp.use(cors({ origin: true }));
manageUsersApp.use(getUserCredentialsMiddleware);

manageUsersApp.get('/', async (req, res) => {
  let users = [];
  try {
    if (!(req['uid'] && req['admin'])) {
      res.status(403).json('Access denied');
      return;
    }
    await auth.listUsers().then((userRecords) => {
      userRecords.users.forEach((user) => {
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
    if (!req['admin']) {
      res.status(403).json('Access denied');
      return;
    }
    const admin = req.body.admin;
    await auth.setCustomUserClaims(req.params.uid, { admin: admin });
    res.status(200).json({ message: 'User role updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not update user role.' });
  }
});
