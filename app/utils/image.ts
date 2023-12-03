export function getCategoryImgSrc(imageId?: string | null) {
  return imageId ? `/resources/category-image/${imageId}` : "";
}
