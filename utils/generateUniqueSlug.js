const slugify = require("slugify");
const Product = require("../models/Product");

const generateUniqueSlug = async (name) => {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = generateUniqueSlug;
