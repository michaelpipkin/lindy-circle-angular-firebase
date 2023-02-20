import { auth } from './init';

export function getUserCredentialsMiddleware(req, res, next) {
  const jwt = req.headers.authorization;
  if (jwt) {
    auth
      .verifyIdToken(jwt)
      .then((jwtPayload) => {
        req['uid'] = jwtPayload.uid;
        req['admin'] = jwtPayload.admin;
        next();
      })
      .catch((err) => {
        console.log('Error ocurred while validating JWT', err);
        next();
      });
  } else {
    next();
  }
}
