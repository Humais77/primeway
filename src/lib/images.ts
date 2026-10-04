export const cloudinaryImage = (publicId: string) => {
  return `/api/images/${publicId
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
};

export const images = {
  brandLogo: cloudinaryImage("be420wykpsyn8nwjp2nx"),
  brandName: cloudinaryImage("s5kbj1m3c4cltfniocof"),
  favicon: cloudinaryImage("favicon"),
  hero: cloudinaryImage("hero"),
};