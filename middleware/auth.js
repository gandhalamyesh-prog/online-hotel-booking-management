function requireCustomer(req, res, next) {
  if (req.session.customer) return next();
  return res.status(401).json({ message: 'Please log in as a customer first.' });
}

function requireAdmin(req, res, next) {
  if (req.session.admin) return next();
  return res.status(401).json({ message: 'Administrator login required.' });
}

module.exports = { requireCustomer, requireAdmin };
