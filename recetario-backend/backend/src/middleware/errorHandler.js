module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Datos inválidos', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID inválido' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).find((k) => k !== 'owner') || 'campo';
    const labels = { email: 'correo', titleNormalized: 'título', nameNormalized: 'nombre' };
    return res.status(409).json({ message: `Ya existe un registro con ese ${labels[field] || field}` });
  }
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
};
