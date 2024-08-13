exports.renderError = (_, res) => {
  res.status(404).render('error', {
    pageTitle: 'Error',
    path: ''
  });
};