export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    // Always return an array, even if empty
    res.json(Array.isArray(products) ? products : []);
  } catch (error) {
    // Return empty array on error
    res.status(500).json([]);
  }
}; 