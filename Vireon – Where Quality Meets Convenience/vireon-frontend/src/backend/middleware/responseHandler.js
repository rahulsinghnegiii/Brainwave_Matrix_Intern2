const responseHandler = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (req.path.includes('/products') && !Array.isArray(data)) {
      // If it's the products endpoint and data is not an array,
      // convert it to an array or return empty array
      return originalJson.call(this, []);
    }
    return originalJson.call(this, data);
  };
  next();
};

export default responseHandler; 