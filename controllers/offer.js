module.exports.getCars = (req, res, next) => {
  res.status(200).json({
    cars: [
      1, 2, 3
    ]
  })
}

module.exports.postCar = (req, res, next) => {
  const { name, description } = req.body;
  res.status(201).json({
    message: 'A car added!',
    car: {
      id: Date.now().toLocaleString(),
      name,
      description,
    }
  })
}