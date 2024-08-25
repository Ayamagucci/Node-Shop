module.exports = (req, cookieTitle) => {
  const cookies = req.headers.cookie
    .split('; ')
    .map((cookie) => cookie.split('='));
  if (!cookieTitle) return cookies;

  return cookies.find((cookie) => cookie[0] === cookieTitle);
};
